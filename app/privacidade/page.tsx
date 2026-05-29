import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Bolão Copa 2026",
  description:
    "Como a Baterias Joinville coleta, usa e protege seus dados no Bolão da Copa 2026. Direitos LGPD do participante.",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-200">
      <main className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-brand-blue px-4 py-3">
          <div className="rounded-md bg-brand-yellow px-2.5 py-1 text-xs font-bold tracking-tight text-brand-blue-dark">
            Baterias Joinville
          </div>
          <Link href="/" className="text-sm font-medium text-white">
            ← Voltar
          </Link>
        </header>

        <article className="px-5 py-6 text-slate-700">
          <h1 className="text-2xl font-extrabold text-brand-blue-dark">
            Política de Privacidade
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Bolão da Copa 2026 · Baterias Joinville
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Esta política reproduz a seção 9 (LGPD) do{" "}
            <Link href="/regulamento" className="underline">
              regulamento oficial
            </Link>
            .
          </p>

          <hr className="my-6 border-slate-200" />

          <p className="text-sm leading-relaxed">
            A Baterias Joinville coleta os seguintes dados pessoais durante o
            cadastro:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Nome completo</li>
            <li>CPF</li>
            <li>WhatsApp</li>
            <li>Idade</li>
            <li>Bairro</li>
            <li>Instagram (se fornecido voluntariamente)</li>
          </ul>

          <p className="mt-4 text-sm leading-relaxed">
            Adicionalmente, são coletados:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Palpites realizados durante a Copa</li>
            <li>Pontuação obtida</li>
            <li>Mini-ligas criadas ou participadas</li>
          </ul>

          <h2 className="mt-8 text-lg font-bold text-slate-900">
            Finalidades do tratamento
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>
              Operação do Bolão e validação de unicidade dos participantes (1
              cadastro por CPF)
            </li>
            <li>
              Comunicação sobre o Bolão (ranking, resultados) via WhatsApp
            </li>
            <li>
              Identificação do participante para retirada do brinde cortesia
            </li>
            <li>
              Comunicações promocionais sobre produtos e serviços da Baterias
              Joinville, <strong>mediante aceite explícito</strong> do
              participante
            </li>
          </ul>

          <h2 className="mt-8 text-lg font-bold text-slate-900">
            Bases legais
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Consentimento do titular dos dados</li>
            <li>
              Execução de obrigações pré-contratuais (entrega do brinde
              cortesia)
            </li>
            <li>Legítimo interesse (prevenção de fraude no Bolão)</li>
          </ul>

          <h2 className="mt-8 text-lg font-bold text-slate-900">
            Direitos do titular
          </h2>
          <p className="mt-2 text-sm leading-relaxed">
            A qualquer momento, o participante pode solicitar:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Acesso aos seus dados pessoais armazenados</li>
            <li>Correção de dados imprecisos</li>
            <li>
              Exclusão dos dados (&ldquo;direito ao esquecimento&rdquo;)
            </li>
            <li>Revogação do consentimento para comunicações</li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed">
            Solicitações via WhatsApp <strong>(47) 99680-1100</strong> ou
            e-mail <strong>[INSERIR E-MAIL DPO]</strong>.
          </p>

          <h2 className="mt-8 text-lg font-bold text-slate-900">Retenção</h2>
          <p className="mt-2 text-sm leading-relaxed">
            Os dados serão mantidos por até{" "}
            <strong>12 (doze) meses</strong> após o término da Copa (julho de
            2027), exceto se houver consentimento explícito para uso continuado
            em ações de marketing, caso em que o participante poderá revogar a
            qualquer tempo.
          </p>

          <hr className="my-6 border-slate-200" />

          <p className="text-xs text-slate-500">
            Para o regulamento completo do Bolão, veja{" "}
            <Link href="/regulamento" className="underline">
              /regulamento
            </Link>
            .
          </p>
        </article>

        <footer className="bg-slate-50 px-4 py-5 text-center text-[11px] leading-relaxed text-slate-500">
          <p>
            <Link href="/" className="underline">
              ← Voltar pra home
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
