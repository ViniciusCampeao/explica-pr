from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

raiz = Path(__file__).resolve().parents[1]
pasta_extensao = raiz / "extensao"
destino = raiz / "distribuicao" / "explica-pr-extensao.zip"
destino.parent.mkdir(exist_ok=True)

with ZipFile(destino, "w", ZIP_DEFLATED) as pacote:
    for arquivo in sorted(pasta_extensao.iterdir()):
        if arquivo.is_file():
            pacote.write(arquivo, arquivo.name)

print(f"Pacote criado: {destino}")
