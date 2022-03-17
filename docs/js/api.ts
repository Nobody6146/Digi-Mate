class DigimonTCGAPICard
{
    name:string; 
    type:string; 
    color:string; 
    stage:string; 
    attribute:string; 
    level:number; 
    play_cost:number; 
    evolution_cost:number; 
    cardrarity:string; 
    artist:string; 
    dp:number; 
    digi_type:string; 
    cardnumber:string; 
    maineffect:string; 
    soureeffect:string; 
    set_name:string; 
    card_sets:string[];
    image_url:string;
}

class DigimonTCGAPI
{    
    static async getAllCards():Promise<DigimonTradingCard[]>
    {
        let apiResponse = await fetch("https://digimoncard.io/api-public/search.php?sort=name&sortdirection=desc&series=Digimon Card Game")
        let apiJson = await apiResponse.text();
        let apiCards = JSON.parse(apiJson.replace(/&lt;/g, "<").replace(/&gt;/g, ">"))
        return apiCards.map(x => this.mapApiToCard(x)); 
        //return [];
    }

    static mapApiToCard(apiCard: DigimonTCGAPICard): DigimonTradingCard {
        let card = new DigimonTradingCard();
        card.name = apiCard.name;
        card.type = apiCard.type;
        card.color = apiCard.color;
        card.form = apiCard.stage;
        card.attribute = apiCard.attribute;
        card.level = apiCard.level;
        card.playCost = apiCard.play_cost;
        card.evolutionCost = apiCard.evolution_cost;
        card.rarity = apiCard.cardrarity;
        card.rarityValue = this.parseRarityValue(card.rarity);
        card.artist = apiCard.artist; 
        card.dp = apiCard.dp; 
        card.digimonType = apiCard.digi_type ?? null; 
        card.number = apiCard.cardnumber; 
        card.primaryText = apiCard.maineffect ?? ""; 
        card.secondaryText = apiCard.soureeffect ?? "";
        card.effects = this.parseEffects(card.primaryText)
            .concat(this.parseEffects(card.secondaryText));
        card.abilities = this.parseAbilities(card.primaryText)
            .concat(this.parseAbilities(card.secondaryText));
        card.set = this.parseSet(apiCard.set_name);
        card.printings = this.parsePrintings(apiCard.card_sets);
        card.imageUrl = apiCard.image_url;
        card.fullText = this.parseFulltext(card);
        return card;
    }

    static parseRarityValue(rarity:string):number {
        switch(rarity)
        {
            case "Common":
                return 1;
            case "Uncommon":
                return 2;
            case "Rare":
                return 3;
            case "Super Rare":
                return 4;
            default:
                return 1;
        }
    }
    
    static parseEffects(text:string):DigimonTradingCardEffect[] {
        text = text?.trim() ?? "";
        if(text === "")
            return [];
        let effects:DigimonTradingCardEffect[] = [];
        let lines = text.split(/(^\[[^\]]+\]|\. \[[^\]]+\])(?!\. \[)+/)
        for(let i = 1; i < lines.length; i += 2)
        {
            let effectName = lines[i].match(/\[([^\]]+)\]/)[1];
            let effectText = lines[i + 1]
            effects.push({name: effectName, text: effectText});
        }
        return effects;
    }

    static parseAbilities(text:string):DigimonTradingCardAbility[] {
        text = text?.trim() ?? "";
        if(text === "")
            return [];
        let abilities:DigimonTradingCardAbility[] = [];
        let lines = text.split(/\<([^\>]+)\>[^\)]+\(([^\)]+)\)[^\<]*/g);
        for(let i = 1; i < lines.length; i += 3)
        {
            let abilityName = lines[i];
            let abilityText = lines[i + 1];
            let x = abilityName.match(/[0-9]+/)?.[0] ?? "0";
            let regex = new RegExp(x, "g");
            abilities.push({
                name: abilityName.replace(regex, "X"),
                text: abilityText.replace(regex, "X"),
                x: Number.parseInt(x)
            });
        }
        return abilities;
    }

    static parseSet(set:string):DigimonTradingCardSet {
        let [setNumber, setName] = set.split(": ");
        return {number: setNumber, name: setName ?? setNumber};
    }

    static parsePrintings(sets:string[]):DigimonTradingCardSet[] {
        let printings:DigimonTradingCardSet[] = [];
        sets.forEach(x => {
            let [number, name] = x.split(": ");
            if(printings.find(x => x.number === number) !== undefined)
                return;
            printings.push({number: number, name: name ?? number});
        });
        return printings;
    }

    static parseFulltext(card:DigimonTradingCard):string
    {
        let lines:string[] = [];
        Object.values(card)
        .forEach(x => {
            if(Array.isArray(x))
                return;
            lines.push(x?.toString() ?? "");
        })
        return lines.join("\n");
    }
}