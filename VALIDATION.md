# Verificação V4.3 — 09/10/2026

## Base confirmada e preservada

O ZIP baixado diretamente do repositório indicado pelo usuário contém V4. O `app.js` é idêntico ao ZIP V4 local (SHA-256 registrado no README). O código foi revisado em uma cópia separada. `repository-original.zip` e `VOIDCORE-V4-original.zip` preservam as entradas; nenhuma publicação ou escrita no GitHub foi feita.

## Evidências executadas

- Suite original: 13 rotas × 5 larguras (1440, 1024, 768, 390 e 320), 65 combinações sem overflow horizontal; importações, persistência, clipboard, downloads reais, estados inválidos e navegação mobile.
- Suite adicional: ponto CS2 sem barras, comando de alfa, backup do preset anterior, mira salva no autoexec, bloqueio de valor salvo capaz de inserir comandos, defaults/duplicatas VALORANT, edição pela biblioteca, 48 conversões de ida/volta com DPI variados (erro menor que 1e-12), yaw personalizado, salvar conversão e recuperar rascunho, arredondamento R6, invalidação de medida antiga, calibração após reload, comparação reaberta, exportar/restaurar backup e rejeitar restauração inválida sem alterar os dados, fallback de módulo e viewmodel respondendo ao FOV.
- Build estático: sintaxe de app.js e engine.js; 8 páginas e referências locais existentes; hashes dos arquivos de distribuição.
- Inspeção visual: capturas de Home, CS2 e viewmodel desktop/mobile, sem sobreposição dos controles ou overflow horizontal.

Resultados detalhados: `tests/test-results.json`, `tests/upgrade-results.json`, `tests/build-results.json`. As capturas acompanham a pasta.

## Limites explícitos

Não foram executados CS2, VALORANT ou R6. Round trips comprovam consistência do codec e da matemática implementados, não aceitação dentro dos jogos nem equivalência perceptual. CS2 usa yaw padrão 0.022 e VALORANT 0.07; o usuário pode informar m_yaw diferente no CS2. FOV, ADS, aceleração e comportamento do sistema podem mudar a percepção.

O viewmodel usa uma composição 2D de renders gerados, não um modelo Source 2 ou reprodução exata do renderer. A mão é visual; o CFG exporta FOV e offsets. Círculos, Quadrant e contornos especiais continuam referências do editor, com aviso de compatibilidade; os comandos exportados aproximam esses estilos. Códigos binários CSGO-... não são decodificados; a entrada CS2 aceita comandos e JSON.

VALORANT exporta o perfil principal. ADS independente, sniper e campos não mapeados não são garantidos no codec. Os valores omitidos usam defaults definidos no parser, cuja aplicação final deve ser conferida no jogo. Importação/exportação oficial de perfis: https://playvalorant.com/en-gb/news/game-updates/valorant-patch-notes-4-05/ .

R6 usa uma referência medida, com multiplier constante. O slider inteiro pode se afastar do valor teórico; a interface mostra a distância estimada após arredondar. A orientação histórica de hipfire e multiplier está em https://www.ubisoft.com/en-gb/game/rainbow-six/siege/news-updates/6kY6b5JByBY3P6vQWWinla/fov-and-input-sensitivity . Não foi extrapolada para ADS atual.

Advisor e calibração são heurísticos e subjetivos. O backup valida o formato, chaves e setups principais antes de restaurar; não substitui a validação do editor para todos os campos legados. Armazena-se uma versão anterior por chave e um snapshot antes da restauração; exporte arquivos para histórico permanente. Dados pertencem à origem do navegador.

## Revisão visual 4.2 — verificações adicionais executadas

- `tests/visual.cjs`: logotipo e wordmark carregados; mira CS2 e VALORANT centralizadas em zoom 4×; código exportado idêntico antes/depois do zoom; render de rifle carregado; espelhamento de mão; cinco modos de proporção; 12 combinações de preview/largura sem overflow e com área visível utilizável; nenhum erro JavaScript.
- Capturas desktop e mobile de mira e viewmodel, e apresentação da logo, foram inspecionadas visualmente. O fundo geométrico e o rifle poligonal foram substituídos. Os presets e dados v4 continuam usando as mesmas chaves locais.
- O canal alfa do rifle foi verificado: PNG RGBA, transparência real nas bordas. Os renders estão incluídos no pacote; nenhuma chamada a geração de imagem ocorre durante o uso do site.
- O build inclui agora oito páginas e os dois PNGs novos. Testes funcionais originais e adicionais de 4.1 foram repetidos na distribuição 4.2.

As imagens foram geradas para esta interface e são ilustrativas. Não são capturas dos jogos e não substituem validação dentro deles.

## Revisão 4.3 — AK em perspectiva de CS

O rifle genérico foi substituído por `assets/viewmodel-ak47.png`, editado pela ferramenta integrada de imagens. A referência visual é a AK-47 de CS: metal escuro, madeira, carregador curvo, câmera atrás da arma, coronha fora da visão e mãos em luvas. O enquadramento ocupa a região inferior direita e foi ajustado após inspeção das capturas desktop/mobile. Não é um asset extraído do jogo nem um modelo 3D Source 2.

Nesta revisão foram executados novamente os testes visuais, a suite adicional de comportamento e o build estático. A suite original de 65 combinações permanece registrada na revisão 4.2. As versões anteriores foram preservadas.
