import React from 'react';

export default function Regulations() {
  const sections = [
    {
      title: "1. ESCOPO E JURISDIÇÃO",
      content: `Estas regulamentações aplicam-se a todos os torneios e partidas organizadas pela Legion Chess. 
      Todos os participantes devem aceitar e estar em conformidade com estas regras antes de se inscrever.`
    },
    {
      title: "2. MODALIDADES DE JOGO",
      content: `• BLITZ: Tempo de jogo máximo de 3 minutos por jogador, com incremento de 0-2 segundos.
• RAPID: Tempo de jogo entre 10 e 60 minutos por jogador.
• BULLET: Tempo de jogo máximo de 1 minuto por jogador.
• CLASSIC: Tempo de jogo acima de 60 minutos por jogador.`
    },
    {
      title: "3. RATINGS E CLASSIFICAÇÃO",
      content: `3.1 O sistema de rating utilizado é o sistema Elo padrão da FIDE.
3.2 As classificações são atualizadas automaticamente após cada partida.
3.3 Jogadores iniciantes começam com rating de 1200 pontos.
3.4 Prêmios e promoções são baseados no rating e desempenho.`
    },
    {
      title: "4. REGRAS DE JOGO",
      content: `4.1 Todas as partidas devem seguir as regras oficiais de xadrez da FIDE.
4.2 Tabelas de abertura devem ser utilizadas em partidas acima de 30 minutos.
4.3 A Lei dos 50 lances aplica-se a todas as modalidades.
4.4 Empate por repetição de posição ou insuficiência de material é reconhecido automaticamente.`
    },
    {
      title: "5. CONDUTA E ÉTICA",
      content: `5.1 Comportamento respeitoso é obrigatório em todas as interações.
5.2 Proibido: insultos, assédio, linguagem ofensiva ou discriminatória.
5.3 Proibido: uso de engines de xadrez ou assistência externa durante partidas.
5.4 Proibido: compartilhar informações sobre partidas em andamento.
5.5 Violações resultarão em punição que variam de advertência a banimento.`
    },
    {
      title: "6. FRAUDE E MANIPULAÇÃO",
      content: `6.1 Detecta-se automaticamente comportamento suspeito usando algoritmos avançados.
6.2 Contas suspeitas serão investigadas e possivelmente suspensas.
6.3 Combinação de resultados é estritamente proibida e resultará em banimento permanente.
6.4 Múltiplas contas de um mesmo usuário são proibidas.`
    },
    {
      title: "7. RECURSOS E APELAÇÕES",
      content: `7.1 Disputas sobre resultados devem ser reportadas em até 24 horas.
7.2 O tribunal técnico analisará todas as apelações em até 72 horas.
7.3 Decisões podem ser revertidas apenas com evidência contundente.
7.4 Casos de violação graves serão escalados para revisão independente.`
    },
    {
      title: "8. PONTUAÇÃO E PROMOÇÃO",
      content: `8.1 Vitória: +1 ponto (ou ganho de Elo correspondente)
8.2 Empate: +0.5 pontos (sem mudança significativa de Elo)
8.3 Derrota: 0 pontos (perda de Elo correspondente)
8.4 Promoção de ligas ocorre mensalmente baseado em desempenho.`
    },
    {
      title: "9. CRONOGRAMA E PRAZOS",
      content: `9.1 Torneios oficiais ocorrem semanalmente em cada modalidade.
9.2 Inscrições fecham 24 horas antes do torneio.
9.3 Partidas devem começar dentro de 5 minutos da hora agendada.
9.4 Limite de ausência: 2 partidas consecutivas resulta em desqualificação.`
    },
    {
      title: "10. PREMIAÇÃO",
      content: `10.1 Prêmios são distribuídos aos top 10 classificados.
10.2 Ouro: 1º lugar - 5000 pontos Legion
10.3 Prata: 2º-3º lugar - 3000 pontos Legion
10.4 Bronze: 4º-10º lugar - 1000-1500 pontos Legion
10.5 Pontos Legion podem ser trocados por benefícios exclusivos.`
    },
    {
      title: "11. MODIFICAÇÕES DAS REGRAS",
      content: `11.1 A Legion Chess se reserva o direito de modificar estas regulamentações.
11.2 Notificação de mudanças será fornecida com 7 dias de antecedência.
11.3 Mudanças urgentes de segurança podem ser implementadas imediatamente.
11.4 Jogadores concordam em aceitar atualizações ao continuar participando.`
    },
    {
      title: "12. CONTATO E SUPORTE",
      content: `Para questões sobre regulamentações ou reportar violações, entre em contato:
📧 Email: support@legionchess.com
🔗 Discord: Legion Chess Official
⏰ Horário de atendimento: Segunda-Sexta, 09:00-18:00 (Horário de Brasília)`
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="tech-font text-5xl font-black bg-gradient-to-r from-red-500 via-white to-red-500 text-transparent bg-clip-text uppercase tracking-tighter mb-4">
            Regulamentações
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Leia atentamente as regras e regulamentações que regem todas as atividades na plataforma Legion Chess.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div 
              key={idx}
              className="bg-[#111] border border-red-900/20 rounded-2xl p-8 hover:border-red-900/40 transition-all hover:bg-[#1a1a1a]"
            >
              <h2 className="tech-font text-lg font-bold text-red-500 uppercase tracking-wide mb-4">
                {section.title}
              </h2>
              <p className="text-gray-300 whitespace-pre-line leading-relaxed text-sm">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 bg-red-900/10 border border-red-900/30 rounded-2xl p-6 text-center">
          <p className="text-gray-400 text-xs tech-font uppercase">
            Última atualização: Janeiro 2026 | Versão 2.1
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Ao participar da Legion Chess, você concorda com todos os termos e regulamentações acima.
          </p>
        </div>
      </div>
    </div>
  );
}
