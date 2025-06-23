#!/bin/bash
# Script para copiar o arquivo ic_launcher_round.png para todos os diretórios mipmap-*

for dir in android/app/src/main/res/mipmap-*; do
  cp /workspaces/superleitor/.github/resources/ic_launcher_round.png "$dir/"
done

echo "Cópia concluída."
