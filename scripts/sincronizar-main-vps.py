#!/usr/bin/env python3
"""Publica o pacote e a página de download da última versão da main."""

import os
import subprocess
import tempfile
import time
from pathlib import Path, PurePosixPath
from zipfile import ZIP_DEFLATED, ZipFile

REPOSITORIO = "https://github.com/ViniciusCampeao/explica-pr.git"
ESPELHO = Path(os.environ["EXPLICA_PR_ESPELHO_GIT"])
PUBLICACAO = Path(os.environ["EXPLICA_PR_PASTA_PUBLICA"])
ESTADO = Path.home() / ".local/state/explica-pr-publicador/commit"


def git(*argumentos):
    return subprocess.run(
        ["git", "--git-dir", str(ESPELHO), *argumentos],
        check=True,
        capture_output=True,
    ).stdout


def preparar_espelho():
    if not (ESPELHO / "HEAD").exists():
        ESPELHO.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["git", "clone", "--bare", "--quiet", REPOSITORIO, str(ESPELHO)],
            check=True,
        )
    subprocess.run(
        ["git", "--git-dir", str(ESPELHO), "fetch", "--quiet", "origin", "+refs/heads/main:refs/remotes/origin/main"],
        check=True,
    )


def salvar_atomicamente(destino, conteudo):
    with tempfile.NamedTemporaryFile(dir=destino.parent, delete=False) as temporario:
        temporario.write(conteudo)
        caminho_temporario = Path(temporario.name)
    caminho_temporario.chmod(0o644)
    caminho_temporario.replace(destino)


def publicar_se_houver_mudanca():
    preparar_espelho()
    commit = git("rev-parse", "refs/remotes/origin/main").decode().strip()
    if ESTADO.exists() and ESTADO.read_text().strip() == commit:
        return

    PUBLICACAO.mkdir(parents=True, exist_ok=True)
    arquivo_zip = PUBLICACAO / "explica-pr-extensao.zip"
    descritores = git("ls-tree", "-rz", "--full-tree", commit, "--", "extensao/").split(b"\0")
    with tempfile.NamedTemporaryFile(dir=PUBLICACAO, delete=False) as temporario:
        caminho_temporario = Path(temporario.name)
    try:
        with ZipFile(caminho_temporario, "w", ZIP_DEFLATED) as pacote:
            for descritor in descritores:
                if not descritor:
                    continue
                metadados, nome = descritor.split(b"\t", 1)
                modo, tipo, objeto = metadados.decode().split()
                caminho = PurePosixPath(nome.decode())
                if tipo != "blob" or modo not in {"100644", "100755"} or caminho.parts[0] != "extensao":
                    continue
                relativo = PurePosixPath(*caminho.parts[1:])
                if not relativo.parts or relativo.is_absolute() or ".." in relativo.parts:
                    continue
                pacote.writestr(relativo.as_posix(), git("cat-file", "blob", objeto))
        caminho_temporario.chmod(0o644)
        caminho_temporario.replace(arquivo_zip)
    finally:
        caminho_temporario.unlink(missing_ok=True)

    pagina = git("show", f"{commit}:distribuicao/index.html")
    salvar_atomicamente(PUBLICACAO / "index.html", pagina)
    ESTADO.parent.mkdir(parents=True, exist_ok=True)
    salvar_atomicamente(ESTADO, f"{commit}\n".encode())
    print(f"Pacote publicado para main@{commit[:12]}", flush=True)


if __name__ == "__main__":
    while True:
        try:
            publicar_se_houver_mudanca()
        except Exception as erro:
            print(f"Falha ao atualizar o pacote: {erro}", flush=True)
        time.sleep(60)
