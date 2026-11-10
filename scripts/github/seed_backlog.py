#!/usr/bin/env python3
"""
seed_backlog.py — vuelca el Product Backlog (docs/backlog.json) en GitHub.

Fase `issues`  (scope: repo)
  - crea labels y milestones que falten
  - etiqueta y asigna milestone a los issues que ya existen (1..14)
  - crea los issues nuevos del backlog (Sprint 2..4 + icebox)

Fase `project` (scope: project)
  - añade todos los issues al Project v2 (por defecto el nº 2)
  - crea los campos Priority / Points / Sprint / Área / Épica si faltan
  - ajusta las columnas del campo Status
  - rellena los valores de cada item

Uso:
    python3 scripts/github/seed_backlog.py --dry-run
    python3 scripts/github/seed_backlog.py --phase issues
    python3 scripts/github/seed_backlog.py --phase project
    python3 scripts/github/seed_backlog.py --phase all

Token: $GITHUB_TOKEN / $GH_TOKEN o ~/.git-credentials.
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "docs" / "backlog.json"
API = "https://api.github.com"
GQL = "https://api.github.com/graphql"

STATUS_OPTIONS = ["Backlog", "Sprint Backlog", "In Progress", "In Review", "Done"]
STATUS_COLORS = {
    "Backlog": "GRAY",
    "Sprint Backlog": "BLUE",
    "In Progress": "YELLOW",
    "In Review": "PURPLE",
    "Done": "GREEN",
}
PRIORITY_OPTIONS = ["p0-blocker", "p1-high", "p2-med", "p3-low"]
PRIORITY_COLORS = {
    "p0-blocker": "RED",
    "p1-high": "ORANGE",
    "p2-med": "YELLOW",
    "p3-low": "GREEN",
}
SPRINT_OPTIONS = ["Sprint 1", "Sprint 2", "Sprint 3", "Sprint 4", "Sin sprint"]
SPRINT_COLORS = {
    "Sprint 1": "BLUE",
    "Sprint 2": "GREEN",
    "Sprint 3": "PURPLE",
    "Sprint 4": "ORANGE",
    "Sin sprint": "GRAY",
}
AREA_OPTIONS = [
    "Core",
    "UI",
    "Datos",
    "Gameplay",
    "Combate",
    "Economía",
    "Tripulación",
    "Barco",
    "Infraestructura",
    "Calidad",
    "Balance",
]
EPIC_OPTIONS = [f"EP-{i:02d}" for i in range(1, 9)]

DRY = False


# --------------------------------------------------------------------------- #
# HTTP helpers
# --------------------------------------------------------------------------- #
def get_token() -> str:
    for var in ("GITHUB_TOKEN", "GH_TOKEN"):
        value = os.environ.get(var)
        if value:
            return value.strip()
    creds = Path.home() / ".git-credentials"
    if creds.exists():
        for line in creds.read_text().splitlines():
            line = line.strip()
            if not line or "github.com" not in line:
                continue
            try:
                userinfo = line.split("//", 1)[1].split("@", 1)[0]
                if ":" in userinfo:
                    return userinfo.split(":", 1)[1]
            except IndexError:
                continue
    sys.exit("ERROR: no encuentro token. Exporta GITHUB_TOKEN o usa ~/.git-credentials")


def rest(method: str, path: str, data=None, token: str = "", ok=(200, 201)):
    url = API + path
    if DRY and method != "GET":
        print(f"  [dry-run] {method} {path} {json.dumps(data, ensure_ascii=False)[:90] if data else ''}")
        return {}
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if body is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        if exc.code in ok:
            return {}
        raise SystemExit(f"ERROR {method} {path} -> {exc.code}\n{detail}") from exc


def rest_paged(path: str, token: str):
    sep = "&" if "?" in path else "?"
    page = 1
    out = []
    while True:
        chunk = rest("GET", f"{path}{sep}per_page=100&page={page}", token=token)
        if not chunk:
            return out
        out.extend(chunk)
        if len(chunk) < 100:
            return out
        page += 1


def gql(query: str, variables: dict, token: str, mutation: bool = True):
    if DRY and mutation:
        print("  [dry-run] graphql mutation")
        return {}
    body = json.dumps({"query": query, "variables": variables}).encode()
    req = urllib.request.Request(GQL, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            payload = json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"ERROR graphql -> {exc.code}\n{exc.read().decode()}") from exc
    if payload.get("errors"):
        scopes = [e.get("message", "") for e in payload["errors"]]
        if any("read:project" in m or "project" in m.lower() and "scope" in m.lower() for m in scopes):
            raise SystemExit(
                "ERROR: el token no tiene el scope `project`.\n"
                "  Ve a https://github.com/settings/tokens, edita tu token y marca:\n"
                "    [x] repo   [x] workflow   [x] project\n"
                "  Guarda y vuelve a ejecutar este script."
            )
        raise SystemExit("ERROR graphql:\n" + json.dumps(payload["errors"], indent=2))
    return payload["data"]


# --------------------------------------------------------------------------- #
# Fase 1: labels, milestones e issues
# --------------------------------------------------------------------------- #
def ensure_labels(repo: str, labels: dict, token: str):
    existing = {lab["name"] for lab in rest_paged(f"/repos/{repo}/labels", token)}
    created = 0
    for name, color in labels.items():
        if name in existing:
            continue
        rest("POST", f"/repos/{repo}/labels", {"name": name, "color": color}, token)
        print(f"  + label {name}")
        created += 1
    print(f"  labels: {len(existing)} existentes, {created} creadas")


def ensure_milestones(repo: str, titles, token: str) -> dict:
    existing = {m["title"]: m["number"] for m in rest_paged(f"/repos/{repo}/milestones?state=all", token)}
    for title in titles:
        if title in existing:
            continue
        created = rest("POST", f"/repos/{repo}/milestones", {"title": title}, token)
        existing[title] = created["number"]
        print(f"  + milestone {title}")
    print(f"  milestones: {len(existing)} disponibles")
    return existing


def index_issues(repo: str, token: str):
    by_title, by_number = {}, {}
    for issue in rest_paged(f"/repos/{repo}/issues?state=all", token):
        if "pull_request" in issue:
            continue
        by_title[issue["title"]] = issue
        by_number[issue["number"]] = issue
    return by_title, by_number


def apply_meta(repo: str, issue: dict, item: dict, milestones: dict, token: str):
    labels = sorted(set(issue.get("labels", []) and [l["name"] for l in issue["labels"]]) | set(item["labels"]))
    payload = {"labels": labels}
    milestone = milestones.get(item.get("sprint", ""))
    if milestone:
        payload["milestone"] = milestone
    if DRY:
        print(f"  [dry-run] PATCH #{issue['number']} labels={labels} milestone={item.get('sprint')}")
        return
    rest("PATCH", f"/repos/{repo}/issues/{issue['number']}", payload, token)


def phase_issues(cfg: dict, token: str):
    repo = cfg["repo"]
    print("== Fase issues ==")
    ensure_labels(repo, cfg["labels"], token)
    milestones = ensure_milestones(repo, cfg["milestones"], token)
    by_title, by_number = index_issues(repo, token)

    created = 0
    for item in cfg["items"]:
        if item.get("issue"):
            issue = by_number.get(item["issue"])
            if not issue:
                print(f"  ! aviso: no existe el issue #{item['issue']} ({item['id']})")
                continue
            apply_meta(repo, issue, item, milestones, token)
            continue

        if item["title"] in by_title:
            print(f"  = {item['id']} ya existe (#{by_title[item['title']]['number']})")
            continue

        payload = {
            "title": item["title"],
            "body": item.get("body", f"> Backlog: {item['id']}"),
            "labels": item["labels"],
        }
        milestone = milestones.get(item.get("sprint", ""))
        if milestone:
            payload["milestone"] = milestone
        if DRY:
            print(f"  [dry-run] POST issue {item['title']}")
            created += 1
            continue
        issue = rest("POST", f"/repos/{repo}/issues", payload, token)
        print(f"  + #{issue['number']} {item['title']}")
        by_title[item["title"]] = issue
        by_number[issue["number"]] = issue
        created += 1

    print(f"  issues creados: {created}")


# --------------------------------------------------------------------------- #
# Fase 2: Project v2
# --------------------------------------------------------------------------- #
PROJECT_QUERY = """
query($login: String!, $number: Int!) {
  user(login: $login) {
    projectV2(number: $number) {
      id
      title
      items(first: 1) { totalCount }
      fields(first: 50) {
        nodes {
          __typename
          ... on ProjectV2FieldCommon { id name }
          ... on ProjectV2SingleSelectField { options { id name } }
        }
      }
    }
  }
}
"""


def load_project(owner: str, number: int, token: str) -> dict:
    data = gql(PROJECT_QUERY, {"login": owner, "number": number}, token, mutation=False)
    project = (data.get("user") or {}).get("projectV2")
    if not project:
        raise SystemExit(f"ERROR: no encuentro el Project v2 nº {number} de {owner}")
    fields = {}
    for field in project["fields"]["nodes"]:
        fields[field["name"]] = field
    print(f"  project: {project['title']} ({project['id']})")
    return {"id": project["id"], "fields": fields, "item_count": project["items"]["totalCount"]}


def ensure_single_select(project: dict, name: str, options, colors: dict, token: str):
    project_id = project["id"]
    field = project["fields"].get(name)
    wanted = [{"name": opt, "color": colors.get(opt, "GRAY"), "description": ""} for opt in options]

    if field and field["__typename"] == "ProjectV2SingleSelectField":
        have = [opt["name"] for opt in field["options"]]
        missing = [opt for opt in options if opt not in have]
        if not missing:
            return field
        merged = [{"name": opt["name"], "color": colors.get(opt["name"], "GRAY"), "description": ""}
                  for opt in field["options"]]
        merged += [opt for opt in wanted if opt["name"] not in have]
        if project.get("item_count"):
            print("  ! AVISO: reescribir opciones vacía el campo Status de los items existentes.")
            print("    Ejecuta después: --phase status")
        data = gql(
            """mutation($f: ID!, $opts: [ProjectV2SingleSelectFieldOptionInput!]!) {
                 updateProjectV2Field(input: {fieldId: $f, singleSelectOptions: $opts}) {
                   projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } }
                 }
               }""",
            {"f": field["id"], "opts": merged},
            token,
        )
        print(f"  ~ campo {name}: +{len(missing)} opciones")
        updated = data["updateProjectV2Field"]["projectV2Field"]
        project["fields"][name] = {"__typename": "ProjectV2SingleSelectField", **updated}
        return project["fields"][name]

    if field:
        print(f"  ! campo {name} existe con otro tipo ({field['__typename']}); se omite")
        return field

    data = gql(
        """mutation($p: ID!, $name: String!, $opts: [ProjectV2SingleSelectFieldOptionInput!]!) {
             createProjectV2Field(input: {projectId: $p, dataType: SINGLE_SELECT, name: $name, singleSelectOptions: $opts}) {
               projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } }
             }
           }""",
        {"p": project_id, "name": name, "opts": wanted},
        token,
    )
    print(f"  + campo {name}")
    created = data["createProjectV2Field"]["projectV2Field"]
    project["fields"][name] = {"__typename": "ProjectV2SingleSelectField", **created}
    return project["fields"][name]


def ensure_number(project: dict, name: str, token: str):
    field = project["fields"].get(name)
    if field:
        return field
    data = gql(
        """mutation($p: ID!, $name: String!) {
             createProjectV2Field(input: {projectId: $p, dataType: NUMBER, name: $name}) {
               projectV2Field { ... on ProjectV2FieldCommon { id name } }
             }
           }""",
        {"p": project["id"], "name": name},
        token,
    )
    print(f"  + campo {name}")
    project["fields"][name] = data["createProjectV2Field"]["projectV2Field"]
    return project["fields"][name]


def option_id(field: dict, name: str):
    for opt in field.get("options", []):
        if opt["name"] == name:
            return opt["id"]
    return None


def phase_project(cfg: dict, token: str):
    repo = cfg["repo"]
    print("== Fase project ==")
    project = load_project(cfg["owner"], cfg["project_number"], token)

    status_field = ensure_single_select(project, "Status", STATUS_OPTIONS, STATUS_COLORS, token)
    priority_field = ensure_single_select(project, "Priority", PRIORITY_OPTIONS, PRIORITY_COLORS, token)
    sprint_field = ensure_single_select(project, "Sprint", SPRINT_OPTIONS, SPRINT_COLORS, token)
    area_field = ensure_single_select(project, "Área", AREA_OPTIONS, {a: "BLUE" for a in AREA_OPTIONS}, token)
    epic_field = ensure_single_select(project, "Épica", EPIC_OPTIONS, {e: "PURPLE" for e in EPIC_OPTIONS}, token)
    points_field = ensure_number(project, "Points", token)

    by_title, by_number = index_issues(repo, token)

    added = 0
    for item in cfg["items"]:
        issue = by_number.get(item.get("issue")) or by_title.get(item.get("title"))
        if not issue:
            print(f"  ! {item['id']}: issue no encontrado, se omite")
            continue

        if DRY:
            print(f"  [dry-run] item {item['id']} (#{issue['number']}) -> "
                  f"{item['status']} / {item['priority']} / {item['points']}pts / {item['sprint']}")
            added += 1
            continue

        data = gql(
            """mutation($p: ID!, $c: ID!) {
                 addProjectV2ItemById(input: {projectId: $p, contentId: $c}) { item { id } }
               }""",
            {"p": project["id"], "c": issue["node_id"]},
            token,
        )
        item_id = data["addProjectV2ItemById"]["item"]["id"]

        def set_select(field, value):
            if not field or not value:
                return
            oid = option_id(field, value)
            if not oid:
                return
            gql(
                """mutation($p: ID!, $i: ID!, $f: ID!, $o: String!) {
                     updateProjectV2ItemFieldValue(input: {projectId: $p, itemId: $i, fieldId: $f,
                                                          value: {singleSelectOptionId: $o}}) { projectV2Item { id } }
                   }""",
                {"p": project["id"], "i": item_id, "f": field["id"], "o": oid},
                token,
            )

        set_select(status_field, item["status"])
        set_select(priority_field, item["priority"])
        set_select(sprint_field, item["sprint"])
        set_select(area_field, item["area"])
        set_select(epic_field, item["epic"])
        if points_field:
            gql(
                """mutation($p: ID!, $i: ID!, $f: ID!, $n: Float!) {
                     updateProjectV2ItemFieldValue(input: {projectId: $p, itemId: $i, fieldId: $f,
                                                          value: {number: $n}}) { projectV2Item { id } }
                   }""",
                {"p": project["id"], "i": item_id, "f": points_field["id"], "n": float(item["points"])},
                token,
            )

        print(f"  + {item['id']} #{issue['number']} -> {item['status']}")
        added += 1

    print(f"  items en el tablero: {added}")


# --------------------------------------------------------------------------- #
def phase_status(cfg: dict, token: str):
    """Reaplica solo el campo Status (rápido: 1 mutación por item)."""
    repo = cfg["repo"]
    print("== Fase status ==")
    project = load_project(cfg["owner"], cfg["project_number"], token)
    status_field = project["fields"].get("Status")
    if not status_field:
        raise SystemExit("ERROR: el proyecto no tiene campo Status")

    data = gql(
        """query($l: String!, $n: Int!) {
             user(login: $l) { projectV2(number: $n) {
               items(first: 100) { nodes { id content { ... on Issue { number } } } }
             } }
           }""",
        {"l": cfg["owner"], "n": cfg["project_number"]},
        token,
        mutation=False,
    )
    nodes = data["user"]["projectV2"]["items"]["nodes"]
    item_by_issue = {n["content"]["number"]: n["id"] for n in nodes if n.get("content")}

    by_title, by_number = index_issues(repo, token)
    updated = 0
    for item in cfg["items"]:
        issue = by_number.get(item.get("issue")) or by_title.get(item.get("title"))
        if not issue:
            continue
        item_id = item_by_issue.get(issue["number"])
        if not item_id:
            continue
        oid = option_id(status_field, item["status"])
        if not oid:
            print(f"  ! {item['id']}: opción Status '{item['status']}' no existe")
            continue
        if DRY:
            print(f"  [dry-run] {item['id']} #{issue['number']} -> {item['status']}")
            updated += 1
            continue
        gql(
            """mutation($p: ID!, $i: ID!, $f: ID!, $o: String!) {
                 updateProjectV2ItemFieldValue(input: {projectId: $p, itemId: $i, fieldId: $f,
                                                      value: {singleSelectOptionId: $o}}) { projectV2Item { id } }
               }""",
            {"p": project["id"], "i": item_id, "f": status_field["id"], "o": oid},
            token,
        )
        updated += 1
    print(f"  estados actualizados: {updated}")


# --------------------------------------------------------------------------- #
def main():
    global DRY
    parser = argparse.ArgumentParser(description="Vuelca docs/backlog.json en GitHub")
    parser.add_argument("--phase", choices=["issues", "project", "status", "all"], default="all")
    parser.add_argument("--dry-run", action="store_true", help="muestra lo que haría sin escribir")
    parser.add_argument("--only", help="filtra por prefijo de id, ej. PB-1")
    args = parser.parse_args()
    DRY = args.dry_run

    cfg = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if args.only:
        cfg["items"] = [i for i in cfg["items"] if i["id"].startswith(args.only)]
        if not cfg["items"]:
            sys.exit(f"ERROR: ningún item empieza por {args.only}")

    token = get_token()
    if args.phase in ("issues", "all"):
        phase_issues(cfg, token)
    if args.phase in ("project", "all"):
        phase_project(cfg, token)
    if args.phase in ("status", "all"):
        phase_status(cfg, token)
    print("OK")


if __name__ == "__main__":
    main()
