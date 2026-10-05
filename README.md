# VØIDCORE V4

Rebuild de UX/UI do [V-IDCORE](https://github.com/GojoDark/V-IDCORE), a partir do commit `b67bed4a4c00a4bd57fe2e91997ac7742bed8775`, recuperado em 05/10/2026.

## Abrir

Abra `index.html` no navegador. Não há instalação, dependências externas ou build obrigatório. Os arquivos funcionam como um site estático e podem substituir a versão anterior no GitHub Pages. Para testar compartilhamento entre pessoas, hospede a pasta inteira; links `file://` são locais.

## O que mudou

- Identidade original em SVG: símbolo angular separado, wordmark VØIDCORE, preto/grafite e violeta moderado.
- Home com entrada direta nos quatro workspaces, sem blocos redundantes ou espaços de anúncio.
- CS2 com Crosshair, Sensitivity, Viewmodel e Configs separados por intenção.
- VALORANT com Crosshair, Sensitivity e biblioteca Configs.
- R6 com análise de hipfire e multiplier, sem ADS inventado.
- Sensi Hub com calibração em três etapas, conversão isolada e comparação A/B com histórico.
- Preview dominante, controles laterais, campos condicionais e ajustes avançados recolhidos.
- Importação atômica e validada: um campo inválido não aplica o restante do preset.
- Opacidade zero preservada; entradas inválidas não deixam resultados anteriores aparentando estar válidos.
- Clipboard com alternativa local, downloads CFG/JSON, presets locais e links compartilháveis.

## Lógica e pesquisa preservadas

`engine.js` consolida as últimas versões dos renderizadores CS2 e VALORANT presentes no `app.js` original, incluindo os dez estilos CS2 e comportamento por estado. Mantém a fórmula `914.4 / (DPI × sens × yaw)`, CS2 `0.022`, VALORANT `0.07`, inversão matemática, presets, faixas heurísticas do Advisor e refinamento iterativo do Sens Finder (`55–145%`, corte pela resposta e faixa ±6% ao responder “boa”). O Advisor de performance permanece dentro de Configs, explicitamente como orientação heurística, não benchmark.

As quatro cenas são próprias e aproximadas. Resolução é referência de interface, não emulação de rasterização do jogo. Campos de luneta/coice cujo efeito não era implementado na V3 continuam como referência visual e não entram em comandos inventados. O export CS2 limita-se aos comandos suportados pelo editor. Geometrias novas sem equivalência de cvar não são prometidas na exportação.

O codec VALORANT mantém o mapeamento principal da V3, com validação de limites e suporte às cores indexadas na importação. Campos de ADS/sniper não mapeados são informados como não importados; o editor não promete preservar esses campos no código regenerado. Verifique o código dentro do jogo: os testes validam o editor e seu round trip, não executam VALORANT.

### R6: ajuste necessário de precisão

A V3 tratava `MouseSensitivityMultiplierUnit` diretamente como yaw em graus, sem um fator de entrada angular estabelecido. A [documentação oficial da Ubisoft](https://www.ubisoft.com/en-gb/game/rainbow-six/siege/news-updates/6kY6b5JByBY3P6vQWWinla/fov-and-input-sensitivity) define o hipfire como entrada multiplicada por sensibilidade e multiplier. Ela não fundamenta a distância absoluta que a V3 calculava.

A V4 mantém o modificador de entrada `sens × multiplier` e o game-eDPI. Para comparação física ou conversão com R6, pede cm/360° medidos no jogo. Para converter para R6, usa uma referência medida de sensibilidade e DPI, com multiplier constante:

`sens destino = sens referência × DPI referência × cm referência / (DPI destino × cm desejado)`

Esse cálculo relativo não pressupõe uma escala angular não validada. ADS continua fora do escopo. O snapshot integral da V3 está em `source-v3/` para rastreabilidade e recuperação da lógica anterior.

### Viewmodel

O preview V4 é um volume abstrato, com direção de X/Y/Z, redução de escala ao aumentar FOV e referências de mão/aspecto. Não simula Source 2 nem é uma previsão exata da arma. Presets e comandos FOV/offsets da V3 foram preservados.

## Dados locais

V4 usa chaves próprias para setups, viewmodel e miras. A importação de mira CS2 reconhece a chave V3 `voidcore_cs2_crosshair_v3`. Configs VALORANT lê os perfis antigos `voidcore_val_presets`. O histórico A/B preserva `voidcore_sensi_history` (até 12 entradas). Não há conta, servidor de dados ou envio de presets.

## Design system e verificação

Consulte `DESIGN-SYSTEM.md` e abra `design-system.html` para ver cores, controles e estados. `VALIDATION.md` descreve os testes realizados e os limites de validação. `preview-home.png`, `preview-cs2.png` e `preview-mobile.png` mostram a interface verificada.

## Reproduzir os testes (opcional)

O site não exige Node. Para executar o conjunto de regressão, use Node, Chrome instalado e `npm install` seguido de `npm test`. Os testes iniciam um servidor local temporário na porta 4173, fecham o navegador ao terminar e gravam capturas e relatório.
