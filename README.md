# VØIDCORE V4.3

Revisão do código real de https://github.com/GojoDark/V-IDCORE, recuperado em 09/10/2026. O `app.js` remoto tinha o mesmo SHA-256 do pacote V4 original: `DCFCBBB39F377ADC2A448A36CA35BEEE78DB453F661FC6B3C6C928616C1BB606`.

## Abrir

Abra `index.html`. A distribuição é estática, gratuita e não exige instalação, conta, backend ou fontes remotas. Para links compartilháveis entre pessoas, hospede a pasta inteira; links file:// continuam locais.

## Módulos revisados

- Dashboard: preto/roxo, logo preservada, cartões dos setups salvos e atalhos claros.
- CS2 Mira: ponto sem barras na exportação, alfa habilitado, cores predefinidas importadas, espessura/tamanho zero aceitos, importação atômica e JSON.
- CS2 Sensibilidade: m_yaw configurável, cm/360 e faixas calculadas com o yaw real, validação e persistência.
- Viewmodel: rifle e mãos em render PNG com transparência, FOV com escala trigonométrica, offsets, proporções distintas de 4:3 e 5:4, mão visual e exportação CFG validada.
- CS2 Configurações: mira, sensibilidade, m_yaw e viewmodel salvos entram no autoexec. Valores salvos inválidos bloqueiam a exportação correspondente.
- VALORANT Mira: importação não herda campos omitidos do preset anterior; campos duplicados e valores inválidos são rejeitados antes de qualquer alteração.
- VALORANT Biblioteca: perfis podem ser copiados ou reabertos para edição.
- R6: slider horizontal inteiro de 1–100, referência física medida, invalidação da medida ao alterar o setup e bloqueio de medida inválida.
- Sensi Hub: conversão com DPI e yaw configurável, rascunho persistente, salvar no destino, slider R6 arredondado com distância estimada; calibração retomável; comparação A/B com yaw e histórico reabrível.
- Backup global: exportação JSON, restauração com validação preliminar e cópia do estado anterior. Ao salvar, o valor anterior da chave também é preservado com sufixo `_backup`.
- Navegação: módulos em português, seleção consistente, fallback para módulo desconhecido, menu mobile e respeito a movimento reduzido.

## Dados e hospedagem

As chaves v4 foram mantidas. localStorage pertence à origem do navegador: mudar de domínio ou de porta não transfere os dados. Use Backup na instalação anterior e restaure na nova. Guarde o JSON antes de substituir arquivos no seu site. Não houve publicação nem alteração do repositório remoto.

## Validar

Com Node e Playwright disponíveis: `npm test` e `npm run build`. Os resultados executados estão em `tests/test-results.json`, `tests/upgrade-results.json` e `tests/build-results.json`. O build verifica a distribuição estática; não há transpilar nem bundler obrigatório.

Veja `VALIDATION.md` para as evidências e os limites. Nenhum dos três jogos foi executado nesta revisão.

## Revisão visual 4.2

Os previews usam um cenário renderizado com perspectiva, materiais e iluminação natural, em vez do cenário wireframe. A mira continua sendo gerada ao vivo pelos controles, com zoom 1×/2×/4× que não altera os valores exportados. Os modos de cenário variam a iluminação do mesmo estúdio fictício.

O viewmodel substitui o rifle poligonal por um render detalhado de arma, luvas e mangas com canal alfa preservado. O enquadramento responde ao FOV, offsets, mão e proporção, incluindo resize. É uma composição ilustrativa 2D; não reproduz o motor Source 2.

A logo foi redesenhada em SVG: V facetado, sem triângulo solto, e wordmark com letras próprias desenhadas em paths, independente de fontes instaladas. `logo-preview.html` mostra a apresentação da marca.

Testes visuais adicionais em `tests/visual-results.json`: centragem da mira, zoom sem alterar exportação, imagens carregadas, cinco proporções, espelhamento e 12 combinações de preview/largura. As suites anteriores também foram executadas novamente. `ASSETS.md` registra a origem e os prompts dos renders.

## Revisão 4.3 — AK em perspectiva de CS

O rifle genérico foi substituído por `assets/viewmodel-ak47.png`, editado pela ferramenta integrada de imagens. A referência visual é a AK-47 de CS: metal escuro, madeira, carregador curvo, câmera atrás da arma, coronha fora da visão e mãos em luvas. O enquadramento ocupa a região inferior direita e foi ajustado após inspeção das capturas desktop/mobile. Não é um asset extraído do jogo nem um modelo 3D Source 2.

Nesta revisão foram executados novamente os testes visuais, a suite adicional de comportamento e o build estático. A suite original de 65 combinações permanece registrada na revisão 4.2. As versões anteriores foram preservadas.
