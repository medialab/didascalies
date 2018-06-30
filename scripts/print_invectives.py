
import sys, json
from collections import Counter

C = Counter()
with open(sys.argv[1]) as f:
    data = json.load(f)
    for s in data["seances"]:
        for i in s["interventions"]:
            if i["interruption"] and not i["type"] == "didascalie" and 12 > i["nb_mots"] > 8:
                invective = i["intervention"].replace("<p>", "").replace("</p>", "")
                C[invective] += 1

for i in C.keys():
    print i.encode("utf-8")
