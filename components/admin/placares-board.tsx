"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PlacarRow } from "@/components/admin/placar-row";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  salvarPlacaresEmLote,
  type SalvarPlacarLoteItem,
} from "@/app/admin/placares/actions";
import { type AdminMatchRow } from "@/lib/admin/queries";
import { brtDateKey } from "@/lib/dashboard/format";
import { PLACAR_MAX, PLACAR_MIN } from "@/lib/validation/palpite";

type Tab = "hoje" | "pendentes" | "lancados" | "todos";

type Score = { a: string; b: string };

type PlacaresBoardProps = {
  matches: AdminMatchRow[];
  serverNowISO: string;
};

function toStr(n: number | null): string {
  return n != null ? String(n) : "";
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function baselineOf(matches: AdminMatchRow[]): Map<number, Score> {
  const m = new Map<number, Score>();
  for (const mt of matches) {
    m.set(mt.id, { a: toStr(mt.placar_a), b: toStr(mt.placar_b) });
  }
  return m;
}

function placarValido(a: string, b: string): boolean {
  const emptyA = a.trim() === "";
  const emptyB = b.trim() === "";
  if (emptyA && emptyB) return true; // limpar ou nada
  if (emptyA !== emptyB) return false; // só um lado preenchido
  const na = Number(a);
  const nb = Number(b);
  return (
    Number.isInteger(na) &&
    Number.isInteger(nb) &&
    na >= PLACAR_MIN &&
    na <= PLACAR_MAX &&
    nb >= PLACAR_MIN &&
    nb <= PLACAR_MAX
  );
}

export function PlacaresBoard({ matches, serverNowISO }: PlacaresBoardProps) {
  const router = useRouter();

  const baseline = useMemo(() => baselineOf(matches), [matches]);
  const signature = matches
    .map((m) => `${m.id}:${m.placar_a}:${m.placar_b}`)
    .join(",");

  const [scores, setScores] = useState<Map<number, Score>>(() =>
    baselineOf(matches),
  );

  // Resincroniza ao receber novos dados do servidor (após salvar + refresh).
  // Padrão React de ajustar estado no render rastreando a prop anterior.
  const [prevSig, setPrevSig] = useState(signature);
  if (signature !== prevSig) {
    setPrevSig(signature);
    setScores(baselineOf(matches));
  }

  const [tab, setTab] = useState<Tab>("hoje");
  const [busca, setBusca] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(
    null,
  );

  const todayKey = brtDateKey(new Date(serverNowISO));

  const setScore = (id: number, side: "a" | "b", value: string) => {
    setScores((curr) => {
      const cur = curr.get(id) ?? { a: "", b: "" };
      const next = new Map(curr);
      next.set(id, { ...cur, [side]: value });
      return next;
    });
  };

  const isEncerrado = (m: AdminMatchRow) =>
    m.placar_a != null && m.placar_b != null;

  const counts = useMemo(() => {
    let hoje = 0;
    let pendentes = 0;
    let lancados = 0;
    for (const m of matches) {
      if (brtDateKey(new Date(m.kickoff_at)) === todayKey) hoje += 1;
      if (isEncerrado(m)) lancados += 1;
      else pendentes += 1;
    }
    return { hoje, pendentes, lancados, todos: matches.length };
  }, [matches, todayKey]);

  const buscaNorm = normalize(busca.trim());

  const visiveis = matches.filter((m) => {
    if (tab === "hoje" && brtDateKey(new Date(m.kickoff_at)) !== todayKey) {
      return false;
    }
    if (tab === "pendentes" && isEncerrado(m)) return false;
    if (tab === "lancados" && !isEncerrado(m)) return false;
    if (buscaNorm) {
      const alvo = `${normalize(m.selecao_a.nome)} ${normalize(
        m.selecao_b.nome,
      )}`;
      if (!alvo.includes(buscaNorm)) return false;
    }
    return true;
  });

  // Diffs entre o estado atual e o baseline do banco.
  const changes = useMemo(() => {
    const novos: { match: AdminMatchRow; a: number; b: number }[] = [];
    const edicoes: {
      match: AdminMatchRow;
      oldA: number;
      oldB: number;
      a: number;
      b: number;
    }[] = [];
    const limpos: { match: AdminMatchRow; oldA: number; oldB: number }[] = [];
    const invalidIds = new Set<number>();

    for (const m of matches) {
      const base = baseline.get(m.id) ?? { a: "", b: "" };
      const cur = scores.get(m.id) ?? { a: "", b: "" };
      const changed = cur.a !== base.a || cur.b !== base.b;
      if (!changed) continue;

      if (!placarValido(cur.a, cur.b)) {
        invalidIds.add(m.id);
        continue;
      }

      const emptyNow = cur.a.trim() === "" && cur.b.trim() === "";
      const tinha = m.placar_a != null && m.placar_b != null;

      if (emptyNow) {
        if (tinha) {
          limpos.push({ match: m, oldA: m.placar_a!, oldB: m.placar_b! });
        }
        continue; // pendente esvaziado = nada a fazer
      }

      const a = Number(cur.a);
      const b = Number(cur.b);
      if (tinha) {
        edicoes.push({ match: m, oldA: m.placar_a!, oldB: m.placar_b!, a, b });
      } else {
        novos.push({ match: m, a, b });
      }
    }

    return { novos, edicoes, limpos, invalidIds };
  }, [matches, baseline, scores]);

  const totalChanges =
    changes.novos.length + changes.edicoes.length + changes.limpos.length;
  const temInvalido = changes.invalidIds.size > 0;

  const handleSalvarTudo = async () => {
    setMsg(null);
    setConfirmOpen(false);
    setSaving(true);

    const itens: SalvarPlacarLoteItem[] = [
      ...changes.novos.map((c) => ({
        matchId: c.match.id,
        placarA: c.a,
        placarB: c.b,
      })),
      ...changes.edicoes.map((c) => ({
        matchId: c.match.id,
        placarA: c.a,
        placarB: c.b,
      })),
      ...changes.limpos.map((c) => ({
        matchId: c.match.id,
        clear: true as const,
      })),
    ];

    const result = await salvarPlacaresEmLote(itens);
    setSaving(false);

    if (!result.ok) {
      setMsg({ tipo: "erro", texto: result.error });
      return;
    }

    const partes: string[] = [];
    if (result.novos) partes.push(`${result.novos} novo(s)`);
    if (result.edicoes) partes.push(`${result.edicoes} editado(s)`);
    if (result.limpos) partes.push(`${result.limpos} limpo(s)`);
    let texto = `Salvo: ${partes.join(" · ") || "nada a mudar"}. Ranking recalculado (${result.recalculated.participantsUpdated} participantes).`;
    if (result.falhas.length > 0) {
      texto += ` Falharam: ${result.falhas.join(", ")}.`;
    }
    setMsg({ tipo: result.falhas.length > 0 ? "erro" : "ok", texto });
    router.refresh();
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "hoje", label: "Hoje", count: counts.hoje },
    { key: "pendentes", label: "Pendentes", count: counts.pendentes },
    { key: "lancados", label: "Lançados", count: counts.lancados },
    { key: "todos", label: "Todos", count: counts.todos },
  ];

  return (
    <>
      <div className="sticky top-[4.5rem] z-10 space-y-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <div className="flex gap-1.5">
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-brand-blue text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.label} ({t.count})
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar seleção (ex: Brasil)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-blue focus:outline-none"
        />
      </div>

      <section className="space-y-2 px-3 py-3 pb-28">
        {visiveis.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Nenhum jogo encontrado.
          </p>
        ) : (
          visiveis.map((m) => {
            const cur = scores.get(m.id) ?? { a: "", b: "" };
            const base = baseline.get(m.id) ?? { a: "", b: "" };
            return (
              <PlacarRow
                key={m.id}
                kickoffAt={m.kickoff_at}
                fase={m.fase}
                grupo={m.grupo}
                estadio={m.estadio}
                isBrasil={m.is_brasil}
                selecaoA={{
                  nome: m.selecao_a.nome,
                  codigoIso: m.selecao_a.codigo_iso,
                }}
                selecaoB={{
                  nome: m.selecao_b.nome,
                  codigoIso: m.selecao_b.codigo_iso,
                }}
                valueA={cur.a}
                valueB={cur.b}
                encerrado={isEncerrado(m)}
                changed={cur.a !== base.a || cur.b !== base.b}
                invalid={changes.invalidIds.has(m.id)}
                onChange={(side, value) => setScore(m.id, side, value)}
              />
            );
          })
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-2xl border-t border-slate-200 bg-white px-3 py-2.5 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        {msg ? (
          <p
            className={`mb-2 rounded-lg px-3 py-2 text-xs font-medium ${
              msg.tipo === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {msg.texto}
          </p>
        ) : null}
        {temInvalido ? (
          <p className="mb-2 text-xs font-medium text-red-600">
            Confira os placares destacados em vermelho.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          disabled={saving || totalChanges === 0 || temInvalido}
          className="w-full rounded-xl bg-brand-blue py-3 text-sm font-bold text-white transition-colors hover:bg-brand-blue-hover disabled:opacity-50"
        >
          {saving
            ? "Salvando..."
            : totalChanges === 0
              ? "Nenhuma alteração"
              : `Salvar tudo (${totalChanges})`}
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmar {totalChanges} alteração(ões)</DialogTitle>
          </DialogHeader>

          {changes.novos.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
                Novos resultados ({changes.novos.length})
              </p>
              <ul className="space-y-1">
                {changes.novos.map((c) => (
                  <li
                    key={c.match.id}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800"
                  >
                    {c.match.selecao_a.nome} {c.a} × {c.b}{" "}
                    {c.match.selecao_b.nome}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {changes.edicoes.length > 0 || changes.limpos.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-bold tracking-wide text-amber-700 uppercase">
                Alterações ({changes.edicoes.length + changes.limpos.length})
              </p>
              <ul className="space-y-1">
                {changes.edicoes.map((c) => (
                  <li
                    key={c.match.id}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900"
                  >
                    {c.match.selecao_a.nome}{" "}
                    <span className="text-slate-500">
                      {c.oldA} × {c.oldB}
                    </span>{" "}
                    → {c.a} × {c.b} {c.match.selecao_b.nome}
                  </li>
                ))}
                {changes.limpos.map((c) => (
                  <li
                    key={c.match.id}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900"
                  >
                    {c.match.selecao_a.nome}{" "}
                    <span className="text-slate-500">
                      {c.oldA} × {c.oldB}
                    </span>{" "}
                    → <span className="text-red-600">limpar</span>{" "}
                    {c.match.selecao_b.nome}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvarTudo}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white hover:bg-brand-blue-hover"
            >
              Confirmar e salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
