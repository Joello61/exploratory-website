#!/bin/bash
# Usage: ./extract.sh chemin/vers/fichier.ts dossier/destination
#
# Ce script lit le fichier TS donné, extrait chaque bloc d'interface (délimité par "interface <Nom> { ... }"),
# exécute la commande Angular CLI pour créer l'interface dans le dossier cible,
# convertit le nom de l'interface en kebab-case pour retrouver le fichier généré,
# et copie le contenu extrait dans le fichier généré.
#
# Remarque : Le script suppose que les interfaces sont définies de manière simple (non imbriquées)
# et que la commande "ng g interface" crée un fichier nommé en kebab-case (exemple : QuizQuestion -> quiz-question.ts).

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 chemin/vers/fichier.ts dossier/destination"
  exit 1
fi

INPUT_FILE="$1"
TARGET_DIR="$2"

if [ ! -f "$INPUT_FILE" ]; then
  echo "Erreur : Le fichier $INPUT_FILE n'existe pas."
  exit 1
fi

# Créer le dossier de destination s'il n'existe pas
mkdir -p "$TARGET_DIR"

# Extraction des blocs d'interface dans le fichier INPUT_FILE.
awk '
/^[[:space:]]*interface[[:space:]]+[A-Za-z0-9_]+/ {
  inInterface = 1;
  block = "";
  braceCount = 0;
}
inInterface {
  block = block $0 "\n";
  n = gsub(/\{/, "{", $0);
  braceCount += n;
  n = gsub(/\}/, "}", $0);
  braceCount -= n;
  if (braceCount == 0 && inInterface) {
    print block "\n---END---";
    inInterface = 0;
  }
}
' "$INPUT_FILE" > interfaces_extracted.txt

# Découper le fichier d'extraction en fichiers individuels
csplit -f tmp_interface_ -b "%03d.txt" interfaces_extracted.txt '/---END---/' '{*}' >/dev/null

for file in tmp_interface_*.txt; do
  # Supprimer la ligne du marqueur
  sed -i '/---END---/d' "$file"
  # Extraire le nom de l'interface depuis la première ligne (ex: "interface QuizQuestion {")
  interfaceName=$(head -n 1 "$file" | sed -n 's/^[[:space:]]*interface[[:space:]]\+\([A-Za-z0-9_]\+\).*/\1/p')
  if [ -z "$interfaceName" ]; then
    echo "Impossible d'extraire le nom de l'interface depuis $file"
    continue
  fi
  echo "Création de l'interface : $interfaceName"
  
  # Créer l'interface avec Angular CLI (sans --skip-import)
  ng g interface "$TARGET_DIR/$interfaceName" --force
  
  # Convertir le nom de l'interface en kebab-case
  kebabName=$(echo "$interfaceName" | sed -r 's/([A-Z])/-\L\1/g' | sed 's/^-//')
  interfaceFile="$TARGET_DIR/${kebabName}.ts"
  
  if [ -f "$interfaceFile" ]; then
    echo "Mise à jour de $interfaceFile"
    # Si la première ligne du bloc extrait ne contient pas "export", l'ajouter
    firstLine=$(head -n 1 "$file")
    if [[ $firstLine != export* ]]; then
      sed -i '1s/^/export /' "$file"
    fi
    cp "$file" "$interfaceFile"
  else
    echo "Erreur : Le fichier généré $interfaceFile est introuvable."
  fi
  rm "$file"
done

rm interfaces_extracted.txt

echo "Extraction et création des interfaces terminées."
