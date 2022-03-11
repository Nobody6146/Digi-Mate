//type DigimonTradingCardType = "Digimon" | "Digi-Egg" | "Option" | "Tamer";
//type DigimonTradingCardColor = "Red" | "Blue" | "Yellow" | "Green" | "White" | "Black" | "Purple";
class DigimonTradingCardEnums
{
    types:string[] = [];
    colors:string[] = [];
    attributes:string[] = [];
    forms:string[] = [];
    rarities:string[] = [];
    digimonTypes:string[] = [];
    effects:DigimonTradingCardEffect[] = [];
    abilities:DigimonTradingCardAbility[] = [];
    sets:DigimonTradingCardSet[] = [];
    setNumbers:string[] = [];
    setNames:string[] = [];
}

class DigimonTradingCardEffect {
    name:string;
    text:string;
}

class DigimonTradingCardAbility {
    name:string;
    text:string;
    x:number;
}

class DigimonTradingCardSet {
    name:string;
    number:string;
}

class DigimonTradingCardRarity {
    name:string;
    symbol:string;
}

class DigimonTradingCard
{
    name: string;
    type: string;
    color: string;
    form:string; 
    attribute:string; 
    level:number; 
    playCost:number; 
    evolutionCost:number; 
    rarity:string; 
    artist:string; 
    dp:number; 
    digimonType:string; 
    number:string; 
    primaryText:string;
    secondaryText:string;
    effects: DigimonTradingCardEffect[];
    abilities: DigimonTradingCardAbility[];
    set:DigimonTradingCardSet; 
    printings: DigimonTradingCardSet[];
    imageUrl:string;
    fullText:string;
}

type DigimonTradingCardDetail = DigimonTradingCard;

class DigimonTradingCardEvaluator
{
    static loadCardEnums(cards:DigimonTradingCard[]): DigimonTradingCardEnums
    {
        let cardEnums = new DigimonTradingCardEnums();
        cards.forEach(card => {
            if(cardEnums.types.find(x => x === card.type) === undefined)
                cardEnums.types.push(card.type);
            if(cardEnums.colors.find(x => x === card.color) === undefined)
                cardEnums.colors.push(card.color);
            if(cardEnums.attributes.find(x => x === card.attribute) === undefined)
                cardEnums.attributes.push(card.attribute);
            if(cardEnums.forms.find(x => x === card.form) === undefined)
                cardEnums.forms.push(card.form);
            if(cardEnums.rarities.find(x => x === card.rarity) === undefined)
                cardEnums.rarities.push(card.rarity);
            if(cardEnums.digimonTypes.find(x => x === card.digimonType) === undefined)
                cardEnums.digimonTypes.push(card.digimonType);
            card.effects.forEach(effect => {
                if(cardEnums.effects.find(x => x.name === effect.name) === undefined)
                    cardEnums.effects.push(effect);
            });
            card.abilities.forEach(ability => {
                if(cardEnums.abilities.find(x => x.name === ability.name) === undefined)
                    cardEnums.abilities.push(ability);
            });
            if(cardEnums.sets.find(x => x.number === card.set.number) === undefined)
                cardEnums.sets.push(card.set);
        });

        cardEnums.types = cardEnums.types.sort();
        cardEnums.colors = cardEnums.colors.sort();
        cardEnums.attributes = cardEnums.attributes.sort();
        cardEnums.forms = cardEnums.forms.sort();
        cardEnums.rarities = cardEnums.rarities.sort();
        cardEnums.digimonTypes = cardEnums.digimonTypes.sort();
        cardEnums.effects = cardEnums.effects.sort((x, y) => x.name < y.name ? -1 : 1);
        cardEnums.abilities = cardEnums.abilities.sort((x, y) => x.name < y.name ? -1 : 1);
        cardEnums.sets = cardEnums.sets.sort((x, y) => x.name < y.name ? -1 : 1);
        cardEnums.setNames = cardEnums.sets.map(x => x.name).sort();
        cardEnums.setNumbers = cardEnums.sets.map(x => x.number);

        return cardEnums;
    }
}