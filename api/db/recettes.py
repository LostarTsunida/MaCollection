"""Données du catalogue utilisées par seed.py : 48 recettes réparties sur 8 régions."""
import re
import unicodedata

from api.db.fiches import FICHES_PAR_TITRE, temps_total

# (titre, région, temps en minutes, difficulté, mot-clé pour la photo, description)
_LIGNES = [
    # --- Italie ---
    ("Pizza Margherita", "Italienne", 90, "moyen", "pizza",
     "Pâte fine, sauce tomate, mozzarella et basilic frais. La pizza napolitaine la plus classique."),
    ("Lasagnes à la bolognaise", "Italienne", 120, "moyen", "lasagna",
     "Couches de pâtes, sauce bolognaise mijotée et béchamel, gratinées au parmesan."),
    ("Risotto aux champignons", "Italienne", 40, "moyen", "risotto",
     "Riz arborio cuit doucement au bouillon avec des champignons, du parmesan et un peu de beurre."),
    ("Spaghetti carbonara", "Italienne", 25, "facile", "carbonara",
     "Spaghetti, guanciale, jaunes d'œufs et pecorino. Pas de crème dans la vraie recette !"),
    ("Tiramisu", "Italienne", 30, "facile", "tiramisu",
     "Biscuits imbibés de café, crème au mascarpone et cacao. À préparer la veille."),
    ("Osso buco", "Italienne", 150, "difficile", "ossobuco",
     "Jarret de veau braisé avec tomates et vin blanc, servi avec une gremolata au citron."),
    # --- France ---
    ("Bœuf bourguignon", "Française", 210, "moyen", "stew",
     "Bœuf mijoté longtemps dans le vin rouge avec carottes, lardons, champignons et petits oignons."),
    ("Ratatouille", "Française", 75, "facile", "ratatouille",
     "Légumes du soleil (aubergine, courgette, poivron, tomate) cuits doucement à l'huile d'olive."),
    ("Quiche lorraine", "Française", 60, "facile", "quiche",
     "Pâte brisée garnie d'un appareil œufs-crème et de lardons. Parfaite avec une salade."),
    ("Crêpes", "Française", 30, "facile", "crepes",
     "Pâte à crêpes simple à garnir de sucre, de confiture ou de pâte à tartiner."),
    ("Blanquette de veau", "Française", 150, "moyen", "veal",
     "Veau cuit dans un bouillon puis nappé d'une sauce crémeuse au citron, avec du riz."),
    ("Tarte Tatin", "Française", 80, "moyen", "tart",
     "Tarte aux pommes caramélisées cuite à l'envers puis retournée au moment de servir."),
    # --- Espagne ---
    ("Paella valenciana", "Espagnole", 70, "difficile", "paella",
     "Riz au safran cuit dans une grande poêle avec poulet, lapin et haricots verts."),
    ("Tortilla de patatas", "Espagnole", 45, "moyen", "tortilla",
     "Omelette épaisse aux pommes de terre et oignons, servie chaude ou froide en tapas."),
    ("Gazpacho", "Espagnole", 20, "facile", "gazpacho",
     "Soupe froide de tomates, concombre, poivron et ail, idéale en été."),
    ("Churros", "Espagnole", 35, "moyen", "churros",
     "Beignets frits en forme de bâtonnets, roulés dans le sucre et trempés dans du chocolat chaud."),
    ("Patatas bravas", "Espagnole", 40, "facile", "potatoes",
     "Pommes de terre dorées servies avec une sauce tomate relevée au paprika."),
    ("Crema catalana", "Espagnole", 30, "moyen", "custard",
     "Crème parfumée au citron et à la cannelle, avec une fine couche de sucre caramélisé."),
    # --- Chine ---
    ("Canard laqué", "Chinoise", 240, "difficile", "duck",
     "Canard à la peau croustillante et laquée, servi avec des crêpes fines, concombre et sauce hoisin."),
    ("Porc aigre-doux", "Chinoise", 45, "moyen", "pork",
     "Morceaux de porc frits enrobés d'une sauce sucrée-acide avec ananas et poivrons."),
    ("Raviolis vapeur (jiaozi)", "Chinoise", 60, "moyen", "dumplings",
     "Petits raviolis farcis au porc et au chou, cuits à la vapeur et trempés dans une sauce soja."),
    ("Riz cantonais", "Chinoise", 25, "facile", "friedrice",
     "Riz sauté au wok avec œuf, petits pois, jambon et oignons nouveaux."),
    ("Poulet Kung Pao", "Chinoise", 30, "moyen", "chicken",
     "Poulet sauté aux cacahuètes et piments séchés, spécialité du Sichuan."),
    ("Mapo tofu", "Chinoise", 30, "moyen", "tofu",
     "Tofu soyeux dans une sauce épicée au porc haché et au poivre du Sichuan."),
    # --- Japon ---
    ("Makis au saumon", "Japonaise", 50, "moyen", "sushi",
     "Rouleaux de riz vinaigré et de saumon entourés d'une feuille d'algue nori."),
    ("Ramen shoyu", "Japonaise", 180, "difficile", "ramen",
     "Nouilles dans un bouillon à la sauce soja, avec œuf mollet, porc chashu et oignons verts."),
    ("Tempura de crevettes", "Japonaise", 30, "moyen", "tempura",
     "Crevettes enrobées d'une pâte très légère et frites jusqu'à être croustillantes."),
    ("Okonomiyaki", "Japonaise", 35, "facile", "okonomiyaki",
     "Galette au chou garnie selon les envies, avec sauce okonomi et mayonnaise."),
    ("Poulet teriyaki", "Japonaise", 25, "facile", "teriyaki",
     "Poulet poêlé et laqué dans une sauce sucrée à base de soja et de mirin."),
    ("Mochi", "Japonaise", 40, "moyen", "mochi",
     "Petites boules de pâte de riz gluant fourrées à la pâte de haricots rouges."),
    ("Onigiri", "Japonaise", 65, "facile", "onigiri",
     "Triangles de riz japonais garnis de saumon grillé ou de thon mayonnaise, entourés d'une bande d'algue nori."),
    # --- Inde ---
    ("Poulet tikka masala", "Indienne", 60, "moyen", "curry",
     "Poulet mariné et grillé, servi dans une sauce tomate crémeuse et épicée."),
    ("Dal de lentilles corail", "Indienne", 35, "facile", "dal",
     "Lentilles corail cuites avec du curcuma, du cumin et du lait de coco."),
    ("Biryani au poulet", "Indienne", 90, "difficile", "biryani",
     "Riz basmati parfumé aux épices cuit en couches avec du poulet mariné."),
    ("Naan au fromage", "Indienne", 45, "facile", "naan",
     "Pain moelleux cuit à la poêle et fourré au fromage fondu."),
    ("Palak paneer", "Indienne", 40, "moyen", "spinach",
     "Cubes de fromage paneer dans une purée d'épinards aux épices."),
    ("Lassi à la mangue", "Indienne", 10, "facile", "mango",
     "Boisson fraîche au yaourt et à la mangue, parfois parfumée à la cardamome."),
    # --- Mexique ---
    ("Tacos al pastor", "Mexicaine", 60, "moyen", "tacos",
     "Tortillas de maïs garnies de porc mariné au piment et à l'ananas, coriandre et oignon."),
    ("Guacamole", "Mexicaine", 15, "facile", "guacamole",
     "Avocats écrasés avec citron vert, oignon, tomate, coriandre et un peu de piment."),
    ("Enchiladas au poulet", "Mexicaine", 55, "moyen", "enchiladas",
     "Tortillas roulées autour de poulet effiloché, nappées de sauce et gratinées."),
    ("Quesadillas", "Mexicaine", 20, "facile", "quesadilla",
     "Tortillas de blé pliées et dorées à la poêle avec du fromage fondu."),
    ("Chili con carne", "Mexicaine", 90, "facile", "chili",
     "Bœuf haché, haricots rouges, tomates et épices mijotés longtemps."),
    ("Pozole rojo", "Mexicaine", 180, "difficile", "soup",
     "Soupe de maïs et de porc au piment rouge, servie avec radis, chou et citron vert."),
    # --- Maroc ---
    ("Couscous royal", "Marocaine", 150, "difficile", "couscous",
     "Semoule, légumes, bouillon épicé, merguez, poulet et agneau."),
    ("Tajine de poulet aux citrons confits", "Marocaine", 90, "moyen", "tajine",
     "Poulet mijoté avec citrons confits, olives vertes et épices."),
    ("Pastilla au poulet", "Marocaine", 120, "difficile", "pie",
     "Feuilles de brick croustillantes, poulet aux épices et amandes, saupoudrées de sucre glace et cannelle."),
    ("Harira", "Marocaine", 90, "moyen", "lentils",
     "Soupe de tomates, lentilles et pois chiches aux herbes fraîches."),
    ("Zaalouk", "Marocaine", 40, "facile", "eggplant",
     "Salade cuite d'aubergines et de tomates au cumin et à l'ail, à manger avec du pain."),
    ("Cornes de gazelle", "Marocaine", 75, "difficile", "pastry",
     "Petits gâteaux en forme de croissant fourrés à la pâte d'amande et à la fleur d'oranger."),
    # --- États-Unis ---
    ("Cheeseburger", "Américaine", 30, "facile", "burger",
     "Pain brioché, steak haché bien grillé, cheddar fondu, cornichons et sauce maison : le classique des diners."),
    ("Mac and cheese", "Américaine", 45, "facile", "macaroni",
     "Macaronis nappés d'une sauce crémeuse au cheddar, gratinés au four avec une croûte croustillante."),
    ("Pancakes", "Américaine", 25, "facile", "pancakes",
     "Pancakes épais et moelleux, servis en pile avec du beurre et du sirop d'érable pour le petit-déjeuner."),
]


def slug(titre: str) -> str:
    """Nom de fichier de l'image : "Bœuf bourguignon" -> "boeuf-bourguignon"."""
    texte = unicodedata.normalize("NFKD", titre.replace("œ", "oe"))
    texte = texte.encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", texte).strip("-")


def _vers_item(numero: int, ligne: tuple[str, str, int, str, str, str]) -> dict[str, str | int]:
    titre, region, _temps, _difficulte, _mot_cle, description = ligne
    fiche = FICHES_PAR_TITRE[titre]
    return {
        "titre": titre,
        "categorie": region,
        "description": description,
        # illustration servie par le front (web/public/images/recettes)
        "image_url": f"/images/recettes/{slug(titre)}.svg",
        "annee": 2024 + numero % 3,  # année d'ajout de la fiche au catalogue
        "temps_preparation": temps_total(fiche),  # temps total affiché sur les cartes
        "difficulte": fiche["difficulte"],
    }


RECETTES = [_vers_item(numero, ligne) for numero, ligne in enumerate(_LIGNES, start=1)]
