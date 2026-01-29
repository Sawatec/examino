import json

# Erklärungen für jede Frage-ID
explanations = {
    "interface-1": "Das Sampler-Interface definiert die Methode getColor(Vec2 at), die für beliebige 2D-Koordinaten eine Farbe zurückgibt. Das ist das Kernkonzept der prozeduralen Bildgenerierung: Statt Pixel direkt zu zeichnen, definiert man eine Funktion, die jedem Punkt im Raum eine Farbe zuordnet. ColoredDiscs implementiert dieses Interface und berechnet für jeden Punkt, welche Scheibe (falls vorhanden) an dieser Stelle liegt und gibt deren Farbe zurück.",
    
    "interface-2": "ColoredDiscs implementiert das Sampler-Interface und stellt die getColor-Methode zur Verfügung. Image ist nur der Container für Pixeldaten, DiscModel2D repräsentiert eine einzelne Scheibe, und ImageWriter ist für das Speichern zuständig. Nur ColoredDiscs hat die Logik, um zu bestimmen, welche Farbe an einem bestimmten Punkt sichtbar sein soll.",
    
    "record-1": "Ein record in Java (ab Version 14) ist eine kompakte Schreibweise für unveränderliche Datenklassen. Für 'record DiscModel2D(Vec2 center, double radius, Color color)' generiert Java automatisch Getter-Methoden center(), radius(), color() sowie equals(), hashCode() und toString(). Alle Felder sind automatisch final. Das spart Boilerplate-Code und signalisiert klar, dass diese Klasse nur Daten halten soll, nicht aber komplexes Verhalten.",
    
    "rgb-1": "RGB ist ein additives Farbmodell, weil Licht unterschiedlicher Wellenlängen addiert wird. Wenn man rotes, grünes und blaues Licht überlagert, erhält man hellere Farben bis hin zu Weiß bei voller Intensität aller drei Kanäle. Das ist der Unterschied zu subtraktiven Modellen wie CMYK (Druckfarben), wo das Mischen dunkler wird. RGB wird für Displays und Monitore verwendet, wo Licht emittiert wird.",
    
    "rgb-2": "Bei additiver Farbmischung überlagern sich die Lichtwellen. Rot + Grün = Gelb. Das sieht man an den Vektoren: (1,0,0) + (0,1,0) = (1,1,0). Ein Pixel mit maximaler rot- und grün-Intensität, aber ohne Blau, erscheint gelb. Weitere additive Primärfarben-Mischungen: Grün + Blau = Cyan, Rot + Blau = Magenta, Rot + Grün + Blau = Weiß.",
    
    "rgb-3": "Bei Verwendung von double-Werten für RGB repräsentiert (1,1,1) Weiß, da alle Farbkanäle maximal sind. Der Wertebereich ist typischerweise [0.0, 1.0], wobei 0 = keine Intensität und 1 = maximale Intensität bedeutet. Manchmal wird auch [0, 255] für 8-Bit Integer verwendet, aber in der Computergrafik und bei Berechnungen ist [0.0, 1.0] der Standard, da es sich besser für mathematische Operationen eignet.",
    
    "rgb-4": "Schwarz bedeutet das Fehlen von Licht, daher (0,0,0). Alle Farbkanäle sind auf 0, es wird kein rotes, grünes oder blaues Licht emittiert. Das ist das Gegenteil von Weiß (1,1,1), wo alle Kanäle maximal sind.",
    
    "rgb-5": "Skalarmultiplikation wird komponentenweise ausgeführt: (0.2, 0.6, 1.0) * 0.5 = (0.2*0.5, 0.6*0.5, 1.0*0.5) = (0.1, 0.3, 0.5). Dies ist wichtig für Helligkeitsanpassungen und Beleuchtungsberechnungen. Eine Multiplikation mit einem Wert < 1 macht die Farbe dunkler, ein Wert > 1 würde sie heller machen (wobei Werte dann geclampt werden müssen auf [0,1]).",
    
    "rgb-6": "Gewichtete Farbmischung (Linearkombination) wird als c1 · w + c2 · (1 − w) berechnet, wobei w ∈ [0,1]. Wenn w=0, erhält man c2; wenn w=1, erhält man c1. Bei w=0.5 bekommt man eine 50/50-Mischung. Die Gewichte müssen sich zu 1 addieren, damit das Ergebnis im gültigen Bereich bleibt. Dies ist die Grundlage für Interpolation, Alpha-Blending und viele andere Operationen in der Computergrafik.",
    
    "rgb-7": "Blau (0,0,1) + Grün (0,1,0) = Cyan (0,1,1). Cyan ist eine Sekundärfarbe im RGB-Modell. Es entsteht durch die Addition der beiden Primärfarben Grün und Blau. Cyan hat daher maximale Intensität in Grün und Blau, aber kein Rot.",
    
    "array-1": "In der Computergrafik liegt (0,0) typischerweise links oben. Die i-Koordinate (x) wächst nach rechts, die j-Koordinate (y) wächst nach unten. Das ist anders als in der Mathematik, wo der Ursprung oft unten links ist und y nach oben wächst. Für Bildverarbeitung ist die Konvention 'links oben' üblich, weil Dateiformate Pixel oft zeilenweise von oben nach unten speichern.",
    
    "array-2": "Im Rasterbild wächst j typischerweise nach unten. Das entspricht der Zeilenreihenfolge in Bilddateien und der Art, wie Text auf einer Seite gelesen wird: von oben nach unten. Bei mathematischen Koordinatensystemen würde y nach oben wachsen, aber in der Bildverarbeitung ist die Konvention umgekehrt.",
    
    "array-3": "1D-Arrays sind effizienter für viele Operationen: direkter Speicherzugriff, bessere Cache-Nutzung, einfachere Serialisierung und Kompatibilität mit Grafik-APIs. 2D-Arrays wären möglich (double[][]), aber man müsste erst für jede Zeile ein Array anlegen. Ein 1D-Array ist ein zusammenhängender Speicherblock, was Performance-Vorteile bringt. Die Berechnung des Index (j * width + i) ist schnell und einfach.",
    
    "array-4": "Für Pixel (i=4, j=2) ohne RGB-Interleaving: index = j * M + i = 2 * 10 + 4 = 24. Die Formel j * M + i wandelt 2D-Koordinaten in einen 1D-Index um. M ist die Anzahl der Spalten (width). Man springt j Zeilen nach unten (jede Zeile hat M Pixel) und dann i Pixel nach rechts. Beispiel: Bei 10 Spalten ist Pixel (4,2) an Position 24 im Array.",
    
    "array-5": "Pixel-interleaved bedeutet, dass die R-, G- und B-Werte eines Pixels direkt hintereinander im Array liegen: [R0, G0, B0, R1, G1, B1, R2, G2, B2, ...]. Das Gegenteil wäre channel-interleaved (planar): erst alle R-Werte, dann alle G-Werte, dann alle B-Werte. Pixel-interleaved ist üblich, weil die Farbkanäle eines Pixels oft zusammen verarbeitet werden und so im Cache bleiben.",
    
    "array-6": "Bei pixel-interleaved RGB mit C=3 Kanälen liegt die grüne Komponente von Pixel (i,j) bei Index: k = 3 · (j · M + i) + 1. Zuerst berechnet man den Pixelindex (j · M + i), multipliziert mit 3 (da jedes Pixel 3 Werte hat), und addiert 1 für den G-Kanal (0=R, 1=G, 2=B). Beispiel: Pixel an Position 10 hat RGB bei Indizes 30, 31, 32.",
    
    "array-7": "width=4, height=3, RGB mit double: Anzahl Pixel = 4 * 3 = 12. Jedes Pixel braucht 3 Werte (R,G,B). Gesamt: 12 * 3 = 36 double-Werte. Das Array muss groß genug sein für alle Farbwerte aller Pixel. Bei width * height * 3 hat man genau die richtige Größe für pixel-interleaved RGB.",
    
    "code-1": "Die verschachtelte Schleife iteriert über alle Pixel (i,j) des Bildes. Für jedes Pixel wird obj.getColor(new Vec2(i, j)) aufgerufen, um die Farbe an dieser Position zu berechnen. Diese Farbe wird dann mit setPixel ins Image geschrieben. So entsteht das Bild: Man tastet jeden Punkt ab (Sampling) und fragt das Sampler-Objekt nach der Farbe.",
    
    "getpixel-1": "getPixel liest einen Farbwert aus: Zuerst wird der Index im Datenarray berechnet (wo liegen die RGB-Werte für Pixel (i,j)?), dann werden die drei aufeinanderfolgenden Werte (R, G, B) aus dem Array gelesen und als Color-Objekt zurückgegeben. Das ist das Gegenstück zu setPixel und wird z.B. für Bildverarbeitung oder das Auslesen von Pixelwerten benötigt.",
    
    "arraysize-1": "width * height ergibt die Gesamtzahl der Pixel. Jedes Pixel hat 3 Farbkanäle (R, G, B), daher: width * height * 3 Einträge im Array. Bei einem 640x480 Bild sind das 640 * 480 * 3 = 921.600 double-Werte. Würde man nur width * height verwenden, hätte man zu wenig Platz und würde ArrayIndexOutOfBoundsException bekommen.",
    
    "code-2": "Mit i <= width läuft die Schleife von 0 bis width (einschließlich), also width+1 Iterationen. Da das Array aber nur Indizes 0 bis width-1 hat, führt der Zugriff auf Pixel (width, j) zu einem ArrayIndexOutOfBoundsException. Korrekt ist i < width oder i != width (bei Start mit 0). Der Unterschied zwischen < und != ist hier nur stilistisch, aber != macht explizit, dass man genau bis width-1 geht.",
    
    "code-3": "Nach dem Füllen des Bildes muss image.writePNG(\"a01-discs\") aufgerufen werden, um das Bild tatsächlich als PNG-Datei zu speichern. Ohne diesen Aufruf existiert das Bild nur im Speicher und geht beim Programmende verloren. writePNG verwendet intern ImageWriter, um das double-Array in ein PNG-Format zu konvertieren und auf die Festplatte zu schreiben.",
    
    "image-1": "Der Faktor * 3 ist nötig, weil jedes Pixel 3 Farbwerte (R, G, B) im Array belegt. Ohne * 3 würde man nur den Pixelindex berechnen, nicht den Arrayindex. Mit * 3 springt man für jedes Pixel um 3 Positionen weiter. Beispiel: Pixel 0 hat RGB bei 0,1,2; Pixel 1 hat RGB bei 3,4,5; Pixel 2 bei 6,7,8 usw.",
    
    "image-2": "Wenn das Array nur width * height groß ist statt width * height * 3, dann passt nur für jedes Pixel ein Wert rein. Beim Schreiben von data[index + 1] und data[index + 2] greift man aber auf Positionen zu, die über die Arraygröße hinausgehen. Resultat: ArrayIndexOutOfBoundsException. Es ist ein häufiger Fehler, das * 3 zu vergessen.",
    
    "image-3": "setPixel schreibt einen Farbwert ins Datenarray. Für Pixel (i,j) wird zuerst der Startindex berechnet, dann werden die drei Farbkomponenten (R, G, B) an die Positionen index, index+1, index+2 geschrieben. So wird das Color-Objekt in das interleaved Array-Format übersetzt. Später kann man mit getPixel diese Werte wieder auslesen.",
    
    "image-4": "ImageWriter.writePNG(name, data, width, height) ist die korrekte Signatur. Man übergibt den Dateinamen, das Datenarray mit den Pixeln und die Bildabmessungen. ImageWriter ist eine Utility-Klasse, die das double-Array in ein PNG-Format konvertiert (z.B. Normierung auf [0,255], Gamma-Korrektur) und die Datei schreibt. Image delegiert diese Aufgabe an ImageWriter.",
    
    "sampling-1": "Abtastung (Sampling) bedeutet hier, dass man für diskrete Pixelpositionen (ganzzahlige i, j) Farbwerte berechnet. Man tastet die kontinuierliche Szene (die durch getColor definiert ist) an diskreten Punkten ab und speichert die Ergebnisse als Rasterbild. Das ist die Brücke zwischen der abstrakten Szenenbeschreibung und dem konkreten Pixel-Array.",
    
    "circle-1": "distance(pos, center) <= radius ist die Bedingung für 'Punkt liegt in oder auf dem Kreisrand'. Das <= inkludiert den Rand. Mit < würde der Rand selbst nicht dazugehören. Die Formel kommt aus der Geometrie: Ein Kreis ist die Menge aller Punkte mit Abstand ≤ radius vom Mittelpunkt. Der Abstand wird über die euklidische Distanz berechnet: sqrt((pos.x - center.x)² + (pos.y - center.y)²).",
    
    "circle-2": "coversPoint berechnet den Abstand zwischen pos und center und vergleicht ihn mit radius. Vec2.subtract(pos, center) gibt den Differenzvektor, Vec2.length berechnet dessen Länge (euklidische Distanz). Wenn diese Distanz ≤ radius ist, liegt der Punkt innerhalb oder auf der Scheibe und die Methode gibt true zurück. Das ist die Kern-Geometrie-Logik für Kreisscheiben.",
    
    "circle-3": "Mit < statt <= würden Punkte genau auf dem Rand (Abstand == radius) als 'nicht drin' gelten. Das würde zu einem dünnen Rand um die Scheibe führen, der nicht gefärbt wird. Je nach Anwendungsfall kann das gewollt oder ungewollt sein. In der Praxis ist <= üblicher, weil man normalerweise den Rand zur Scheibe zählen möchte.",
    
    "discs-1": "color wird mit Color.black initialisiert. Wenn keine Scheibe den Punkt abdeckt, bleibt diese Farbe erhalten und wird zurückgegeben. So bekommt der Hintergrund (alle Bereiche ohne Scheiben) die Farbe Schwarz. Man könnte auch eine andere Hintergrundfarbe wählen, z.B. Weiß oder eine benutzerdefinierte Farbe.",
    
    "discs-2": "Die Bedingung r < radius sorgt dafür, dass immer die kleinste Scheibe gewinnt. Bei Überlappungen werden alle überdeckenden Scheiben geprüft, aber nur die mit dem kleinsten Radius wird ausgewählt. Das erzeugt einen visuellen Effekt, wo kleinere Scheiben 'vorne' liegen. Ohne diese Logik würde die Reihenfolge im Array entscheiden, was weniger vorhersehbar wäre.",
    
    "discs-3": "Double.POSITIVE_INFINITY stellt sicher, dass die erste gefundene Scheibe immer kleiner als radius ist und somit übernommen wird. Bei jedem weiteren Treffer wird geprüft, ob die neue Scheibe noch kleiner ist. Es ist ein gängiges Idiom, um das Minimum zu finden: Man startet mit dem größtmöglichen Wert und aktualisiert bei jedem kleineren Fund.",
    
    "discs-4": "minRadius + RandomUtil.random() * (maxRadius - minRadius) erzeugt eine Zufallszahl im Intervall [minRadius, maxRadius). RandomUtil.random() liefert einen Wert in [0, 1), der mit der Differenz (maxRadius - minRadius) skaliert und dann um minRadius verschoben wird. So können Scheiben unterschiedlich groß sein, bleiben aber im vorgegebenen Bereich.",
    
    "discs-5": "Die Formel stellt sicher, dass der gesamte Kreis (Mittelpunkt + Radius) im Bild liegt. centerRangeX = width - 2.0 * radius ist der verfügbare Bereich für den Mittelpunkt in x-Richtung, abzüglich des Platzes links und rechts für den Radius. centerX = radius + ... positioniert den Mittelpunkt mindestens radius Pixel vom linken Rand entfernt. So kann keine Scheibe über den Bildrand hinausragen.",
    
    "bug-1": "Ohne * 3 würden alle Pixel nur 1/3 des benötigten Platzes haben. setPixel würde dann oft außerhalb des Arrays schreiben (ArrayIndexOutOfBoundsException) oder Farbwerte überschreiben sich gegenseitig. Die Struktur bricht komplett zusammen, weil die Zuordnung Pixel → Array-Position falsch ist. Das Bild wird unleserlich oder das Programm stürzt ab.",
    
    "constructor-1": "Der Konstruktor benötigt alle Parameter, um die Scheiben zu generieren: discCount (wie viele?), minRadius/maxRadius (Größenbereich), width/height (Bildgröße für Positionierung). Mit diesen Infos kann ColoredDiscs im Konstruktor eine ArrayList von DiscModel2D-Objekten aufbauen, jeweils mit zufälliger Größe, Position und Farbe innerhalb der gegebenen Grenzen.",
    
    "constructor-2": "width und height definieren den Bildbereich, innerhalb dessen die Scheiben liegen müssen. Ohne diese Parameter könnte der Konstruktor die Mittelpunkte nicht korrekt berechnen. Die Formel centerRangeX = width - 2.0 * radius verwendet width, um sicherzustellen, dass keine Scheibe über den Rand hinausragt. Ohne width/height wären die Scheiben unkontrolliert im Raum verteilt.",
    
    "arraylist-1": "ArrayList<DiscModel2D> ist flexibler als ein Array (DiscModel2D[]): Man kann mit add() einfach Elemente anhängen, ohne die Größe vorher festzulegen. ArrayList bietet auch Methoden wie size(), isEmpty(), iterator() usw. Für Collections ist ArrayList oft die bessere Wahl. Ein Array wäre hier möglich, aber man müsste zuerst new DiscModel2D[discCount] initialisieren und dann manuell füllen.",
    
    "vec2-1": "Vec2.subtract(pos, center) berechnet den Vektor von center nach pos: pos - center. Das ist der Differenzvektor, der die Richtung und Distanz zwischen den beiden Punkten repräsentiert. In der Vektorrechnung ist die Subtraktion definiert als komponentenweise Differenz: (pos.x - center.x, pos.y - center.y). Dieser Vektor wird dann verwendet, um die Distanz zu berechnen.",
    
    "vec2-2": "Vec2.length(vector) berechnet die euklidische Länge (Betrag) des Vektors: sqrt(x² + y²). Das ist die Formel für die Distanz vom Ursprung. Bei einem Differenzvektor gibt length die Distanz zwischen den beiden ursprünglichen Punkten zurück. In coversPoint wird das verwendet, um zu prüfen, ob der Abstand ≤ radius ist.",
    
    "final-1": "final bedeutet, dass der Wert nach der Initialisierung (z.B. im Konstruktor) nicht mehr geändert werden kann. Das macht die Variable immutable. Für width und height ist das sinnvoll, weil die Bildgröße nach der Erstellung nicht mehr verändert werden soll. Es verhindert Fehler und signalisiert dem Compiler und anderen Entwicklern die Unveränderlichkeit.",
    
    "final-2": "Um die größte Scheibe gewinnen zu lassen, muss man r > radius prüfen und radius initial auf 0 setzen. Dann wird nur eine Scheibe übernommen, wenn sie größer als alle bisherigen ist. Mit POSITIVE_INFINITY und > würde die Bedingung nie erfüllt sein (keine Scheibe ist größer als Unendlich). Die Initialisierung muss zum Vergleich passen: Für 'kleinste suchen' → start mit INFINITY und <; für 'größte suchen' → start mit 0 und >."
}

# Lade die JSON-Datei
with open('public/questions/01-rasterbilder.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

# Füge Erklärungen hinzu
for question in questions:
    q_id = question.get('id')
    if q_id in explanations:
        question['explanation'] = explanations[q_id]
    else:
        print(f"Warnung: Keine Erklärung für ID {q_id}")

# Speichere die aktualisierte JSON
with open('public/questions/01-rasterbilder.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)

print("Erklärungen erfolgreich hinzugefügt!")
print(f"Insgesamt {len(questions)} Fragen aktualisiert.")
