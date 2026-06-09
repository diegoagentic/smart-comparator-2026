# Smart Comparator — Workflow

Cómo trabajar para evitar el incidente de deploy colgado de mayo 2026.

## El incidente, en 1 párrafo

Mergeamos 21 commits de `smart-comparator-v2` con 7 de `main` divergentes
en un único merge commit. El bundle local builda en 9–13 s, pero algún
contenido del merge hace que el step *post-build* de Vercel cuelgue 11+
minutos en plan Hobby (Production). La misma rama `smart-comparator-v2`
deploya en 17–30 s. El detalle se diagnostica con
`scripts/bisect-deploy.sh` en el repo `smart-comparator-2026`.

## Reglas para evitar repetirlo

1. **Branches feature pequeñas.** 1–3 commits, no 21. Ramificá desde la rama
   de producción actual (`smart-comparator-v2` en el repo `2026`), no desde
   `main`.
2. **Probá el Preview antes de mergear.** Cada push a una rama feature
   genera un Preview en Vercel. Si el Preview falla o cuelga, no mergees.
3. **Nunca mergees a Production una rama que nadie deployó como Preview.**
   El merge automático que hicimos no tenía Preview previo de la unión —
   por eso descubrimos el problema en Production.
4. **Si tenés que unir dos ramas grandes**, hacelo en una rama intermedia
   (`integration/v2-into-main`) con su propio Preview. No mergees directo a
   la rama de producción.
5. **Limitá el bundle.** El warning `Some chunks are larger than 500 kB`
   es señal — partí con `manualChunks` o `React.lazy()` antes de
   ignorarlo.

## Ciclo de cambio normal

```bash
# 1. partir de la rama de producción
git checkout smart-comparator-v2
git pull

# 2. branch feature
git checkout -b feat/mi-cambio

# 3. trabajar, commitear (pequeño)
git add ...
git commit -m "feat(area): qué hace"

# 4. push → Vercel auto-genera Preview
git push -u origin feat/mi-cambio
# revisá el Preview en https://vercel.com/.../smart-comparator-2026/deployments
# si pasa en <2 min, seguí

# 5. merge a producción
git checkout smart-comparator-v2
git merge --ff-only feat/mi-cambio    # solo si es lineal
# o abrir PR en GitHub si querés revisión

# 6. push → trigger Production deploy
git push origin smart-comparator-v2
```

## Reglas de commit

- Inglés en commits (CLAUDE.md preferences).
- Subject corto, imperativo: `feat(ocr): add X`, `fix(login): handle Y`.
- Body cuando el "por qué" no es obvio.
- Co-author tag si trabajaste con Claude.

## Vercel — production branch

- Repo: **`smart-comparator-2026`** (`https://github.com/diegoagentic/smart-comparator-2026`)
- Production branch: **`smart-comparator-v2`** (Vercel Settings → Git)
- Preview deploys: cualquier otra rama push.
- Apex domain: `smart-comparator-2026.vercel.app`.

## Casos comunes

### "Mi Preview pasó pero Production cuelga"
Improbable si seguiste el ciclo, pero pasó una vez (este incidente).
Diagnóstico: `bash scripts/bisect-deploy.sh next` en el repo 2026.

### "Necesito traer cambios de la rama vieja `main`"
No lo hagas en bloque. Cherry-pick commit por commit y verificá Preview
después de cada uno:

```bash
git checkout smart-comparator-v2
git checkout -b feat/cherry-X
git cherry-pick <sha-de-main>
git push -u origin feat/cherry-X
# revisar Preview → si pasa, mergear
```

### "Quiero probar un modal de auth sin email real"
- Click en el panel `dev:` (esquina inferior izquierda) → "Preview NoAccess".
- O abrir `http://localhost:8093/?preview=noaccess&email=foo@bar.com`.

## Repos

| Repo | Estado | Para qué |
|------|--------|----------|
| `smart-comparator` (viejo) | Archivado | Referencia histórica. NO desarrollar acá. |
| `smart-comparator-2026` | Activo | Repo actual. Production = `smart-comparator-v2`. |

El proyecto Vercel viejo (`smart-comparator-olive.vercel.app`) puede
borrarse desde Settings → Advanced → Delete Project cuando se confirme
que el nuevo (`smart-comparator-2026.vercel.app`) está estable.
