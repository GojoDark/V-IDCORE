# Verificação V4 — 05/10/2026

Testes automatizados de navegador realizados em Chrome headless, além da inspeção visual das capturas desktop e mobile. Não foram executados CS2, VALORANT ou R6.

## Verificado

- 13 rotas, incluindo todos os módulos, Home, Sensi Hub e alias `lab.html`.
- 5 larguras: 1440, 1024, 768, 390 e 320 px; 65 combinações sem overflow horizontal ou erro de JavaScript.
- CS2: campos condicionais para ponto, Quadrant e dinâmica clássica; alfa zero; importação de comandos; entrada fora da faixa sem aplicação parcial; salvar/carregar; copiar; exportar e reimportar JSON.
- VALORANT: round trip do perfil principal gerado; valores inválidos rejeitados; zero de comprimento/opacidade respeitado.
- Viewmodel: offsets alteram o volume; preset salvo entra no autoexec.
- Configs: download real de `autoexec.cfg`; valores de FPS inválidos bloqueiam exportação.
- Conversão: resultado esperado CS2 → VALORANT, mudança de DPI, identidade matemática ida/inversa, valores inválidos limpam os resultados, link compartilhado carrega o mesmo setup.
- R6: nenhum cm/360° absoluto inventado; conversão usa referência medida; ausência de medida bloqueia resultado.
- Calibração: sequência setup → teste → resultado, refinamento esperado e salvamento no workspace.
- A/B: equivalência física, histórico persistente, entrada inválida limpa resultados.
- Mobile: navegação abre, Escape fecha; preview aparece antes dos controles.
- Capturas de Home e CS2 verificadas visualmente.

## Limites

Os testes conferem a aplicação e as fórmulas implementadas, não a aplicação dos comandos em motores de jogo. Renderizadores, resoluções, contornos e estados dinâmicos são aproximados. Campos sem exportação mapeada não geram comandos falsos. VALORANT pode mudar o formato dos códigos; confirme no jogo. R6 exige medida física e multiplier constante. Advisor e calibração não constituem previsão de desempenho.

O pacote é uma versão local estática. O repositório remoto não foi alterado e não houve publicação.
