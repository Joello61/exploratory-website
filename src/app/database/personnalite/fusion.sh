#!/bin/bash

# Nom du fichier de sortie
output="fusion.txt"

# Vider le fichier de sortie s'il existe déjà
> "$output"

# Boucle sur tous les fichiers du répertoire courant
for file in *; do
    # Ignorer le fichier de sortie et le script lui-même
    if [[ "$file" != "$output" && "$file" != "$(basename "$0")" && -f "$file" ]]; then
        echo ">>> Début du fichier : $file" >> "$output"
        cat "$file" >> "$output"
        echo -e "\n>>> Fin du fichier : $file\n" >> "$output"
    fi
done

echo "Fusion terminée dans le fichier $output"

