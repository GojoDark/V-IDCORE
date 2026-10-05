# VØIDCORE V3 Release

Toolkit local-first para CS2, VALORANT e Rainbow Six Siege.

## Destaques V3
- CS2 Crosshair Studio redesenhado com 10 estilos visuais, preview parado/correndo/atirando, quatro cenários táticos próprios, cor/alpha/outline, Quadrant Size, presets, importação de comandos `cl_crosshair*` e preset local.
- CS2 Viewmodel Studio em primeira pessoa: `viewmodel_fov`, offsets X/Y/Z, mão visual, cenários, presets e simulação de 16:9, 16:10, 4:3 stretched, 4:3 black bars e 5:4 stretched.
- Sens Advisor, autoexec, binds e Performance Advisor preservados.
- VALORANT: Crosshair Studio, sensibilidade/eDPI e preview dinâmico.
- R6: hipfire com `MouseSensitivityMultiplierUnit` configurável. O site não inventa uma conversão ADS única para ópticas/FOV diferentes.
- VØID LAB: conversor por cm/360°, Sens Advisor, Sens Finder e preset compartilhável.

## Precisão do simulador
Os cenários e a arma do preview são gráficos próprios do VØIDCORE inspirados em FPS tático. O preview é aproximado e não substitui o renderer do jogo. Estilos novos sem cvar pública equivalente validada permanecem visuais e não geram comandos falsos.

## Matemática de sensibilidade
- CS2: `m_yaw 0.022` padrão.
- VALORANT: escala angular `0.07` usada pelo conversor.
- R6 hipfire: multiplier informado pelo usuário; default da interface `0.02`.

## Execução
Abra `index.html`. Não há dependências externas nem build obrigatório.
