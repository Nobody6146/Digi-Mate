class KeyValuePair {
    key;
    value;
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
class HydrateModelKeys {
    static cardDatabase = "cardDatabase";
    static search = "search";
}
class AppCardDatabase {
    cards;
    cardEnums;
}
class AppSearch {
    parameters;
    results;
    query = null;
    constructor() {
        this.parameters = new AppSearchParameters();
        this.results = [];
    }
}
class AppSearchParameters {
    cardName;
    fullText;
    cardType;
    color;
    form;
    attribute;
    level;
    playCost;
    evolutionCost;
    rarity;
    artist;
    dp;
    digimonType;
    number;
    effects;
    abilities;
    setNumber;
    setName;
    constructor() {
        let enums = App.cardDatabase.cardEnums;
        this.cardName = new TextSearchParameter("Card Name", "Any words in the name, e.g. Agumon");
        this.fullText = new TextSearchParameter("Text", "Any words in the name, e.g. trash, Digimon, etc.");
        this.cardType = new SelectSearchParameter("Card Type", enums.types.map(type => new KeyValuePair(type, type)));
        this.attribute = new SelectSearchParameter("Attribute", enums.attributes.map(attribute => new KeyValuePair(attribute, attribute)));
        this.color = new SelectSearchParameter("Color", enums.colors.map(color => new KeyValuePair(color, color)));
        this.form = new SelectSearchParameter("Form", enums.forms.map(form => new KeyValuePair(form, form)));
        this.level = new NumberSearchParameter("Level", "Any numerical value, e.g. 3");
        this.playCost = new NumberSearchParameter("Play Cost", "Any numerical value, e.g. 3");
        this.evolutionCost = new NumberSearchParameter("Evolution Cost", "Any numerical value, e.g. 3");
        this.rarity = new SelectSearchParameter("Rarity", enums.rarities.map(rarity => new KeyValuePair(rarity, rarity)));
        this.artist = new TextSearchParameter("Artist", "Any words in the name, e.g. shosuke");
        this.dp = new NumberSearchParameter("DP", "Any numerical value, e.g. 3");
        this.digimonType = new SelectSearchParameter("Digimon Type", enums.digimonTypes.map(type => new KeyValuePair(type, type)));
        this.number = new TextSearchParameter("Card Number", "Any words in the name, e.g. BT1-041");
        this.effects = new SelectSearchParameter("Effects", enums.effects.map(effect => new KeyValuePair(effect.name, effect.name)));
        this.abilities = new SelectSearchParameter("Abilities", enums.abilities.map(ability => new KeyValuePair(ability.name, ability.name)));
        this.setName = new SelectSearchParameter("Set Name", enums.setNames.map(name => new KeyValuePair(name, name)));
        this.setNumber = new SelectSearchParameter("Set Number", enums.setNumbers.map(num => new KeyValuePair(num, num)));
    }
    static addEffect() {
    }
}
class SearchParameter {
    fieldName;
    paramName;
    placeholder;
    value;
    availableConditions;
    condition;
    constructor(fieldName, placeHolder, value = "", condition = "equal") {
        this.fieldName = fieldName;
        this.paramName = this.fieldName.replace(" ", "").toLowerCase();
        this.placeholder = placeHolder;
        this.value = value;
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual"),
            new KeyValuePair("<", "lessThan"),
            new KeyValuePair("<=", "lessThanOrEqual"),
            new KeyValuePair(">", "greaterThan"),
            new KeyValuePair(">=", "greaterThanOrEqual"),
            new KeyValuePair("Includes", "match"),
            new KeyValuePair("Excludes", "notMatch"),
        ];
        this.condition = condition;
    }
}
class TextSearchParameter extends SearchParameter {
    constructor(fieldName, placeHolder, value = "") {
        super(fieldName, placeHolder, value, "match");
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual"),
            new KeyValuePair("Includes", "match"),
            new KeyValuePair("Excludes", "notMatch"),
        ];
    }
}
class NumberSearchParameter extends SearchParameter {
    constructor(fieldName, placeHolder, value = "") {
        super(fieldName, placeHolder, value, "equal");
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual"),
            new KeyValuePair("<", "lessThan"),
            new KeyValuePair("<=", "lessThanOrEqual"),
            new KeyValuePair(">", "greaterThan"),
            new KeyValuePair(">=", "greaterThanOrEqual"),
        ];
    }
}
class SelectSearchParameter extends SearchParameter {
    options;
    constructor(fieldName, options, value = "") {
        super(fieldName, "", value, "equal");
        this.options = options;
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual")
        ];
    }
}
class SelectSearchListParameter extends SelectSearchParameter {
    list;
    constructor(fieldName, options, values = []) {
        super(fieldName, options);
        this.list = values.map(value => {
            return new SelectSearchParameter(this.fieldName, this.options, value);
        });
    }
}
function logError(error) {
    console.error(error);
    alert(error.message);
}
class App {
    static #hydrate;
    static #cards;
    static get hydrate() {
        return this.#hydrate;
    }
    static async start() {
        let options = new HydrateAppOptions();
        this.#hydrate = new HydrateApp(options);
        this.#cards = new Map();
        await this.loadDatabase();
        this.initializeUi();
    }
    static initializeUi() {
        this.resetSearchParameters();
    }
    static async loadDatabase() {
        try {
            let cards = await DigimonTCGAPI.getAllCards();
            let cardEnums = DigimonTradingCardEvaluator.loadCardEnums(cards);
            this.cardDatabase = { cards, cardEnums };
            cards.forEach(card => {
                App.#cards.set(card.number, card);
            });
            return cards;
        }
        catch (error) {
            logError(error);
            return null;
        }
    }
    static get cards() {
        return this.#cards;
    }
    static get cardDatabase() {
        return this.#hydrate.model(HydrateModelKeys.cardDatabase);
    }
    static set cardDatabase(cardDatabase) {
        this.#hydrate.bind(HydrateModelKeys.cardDatabase, cardDatabase);
    }
    static get search() {
        return this.#hydrate.model(HydrateModelKeys.search);
    }
    static set search(search) {
        this.#hydrate.bind(HydrateModelKeys.search, search);
    }
    static resetSearchParameters() {
        this.search = new AppSearch();
    }
    static searchCards() {
        let parameters = App.hydrate.state(App.search.parameters);
        let textQuery = this.writeSearchQuery(parameters);
        let query = new Function("card", textQuery);
        let results = [...this.#cards.values()].filter(card => query(card));
        this.search.results = results;
        this.search.query = textQuery;
        return results;
    }
    static writeSearchQuery(parameters) {
        let query = [];
        let mockCard = new DigimonTradingCard();
        let mockEffect = new DigimonTradingCardEffect();
        let mockAbility = new DigimonTradingCardAbility();
        if (parameters.cardName.value != "")
            query.push(this.#writeQueryCondition(parameters.cardName, mockCard => mockCard.name));
        if (parameters.fullText.value != "")
            query.push(this.#writeQueryCondition(parameters.fullText, mockCard => mockCard.fullText));
        if (parameters.cardType.value != "")
            query.push(this.#writeQueryCondition(parameters.cardType, mockCard => mockCard.type));
        if (parameters.attribute.value != "")
            query.push(this.#writeQueryCondition(parameters.attribute, mockCard => mockCard.attribute));
        if (parameters.color.value != "")
            query.push(this.#writeQueryCondition(parameters.color, mockCard => mockCard.color));
        if (parameters.form.value != "")
            query.push(this.#writeQueryCondition(parameters.form, mockCard => mockCard.form));
        if (parameters.level.value != "")
            query.push(this.#writeQueryCondition(parameters.level, mockCard => mockCard.level));
        if (parameters.playCost.value != "")
            query.push(this.#writeQueryCondition(parameters.playCost, mockCard => mockCard.playCost));
        if (parameters.evolutionCost.value != "")
            query.push(this.#writeQueryCondition(parameters.evolutionCost, mockCard => mockCard.evolutionCost));
        if (parameters.rarity.value != "")
            query.push(this.#writeQueryCondition(parameters.rarity, mockCard => mockCard.rarity));
        if (parameters.artist.value != "")
            query.push(this.#writeQueryCondition(parameters.artist, mockCard => mockCard.artist));
        if (parameters.dp.value != "")
            query.push(this.#writeQueryCondition(parameters.dp, mockCard => mockCard.dp));
        if (parameters.digimonType.value != "")
            query.push(this.#writeQueryCondition(parameters.digimonType, mockCard => mockCard.digimonType));
        if (parameters.number.value != "")
            query.push(this.#writeQueryCondition(parameters.number, mockCard => mockCard.number));
        if (parameters.effects.value != "")
            query.push(this.#writeQueryListCondition(parameters.effects, mockCard => mockCard.effects, mockEffect => mockEffect.name));
        if (parameters.abilities.value != "")
            query.push(this.#writeQueryListCondition(parameters.abilities, mockCard => mockCard.abilities, mockAbility => mockAbility.name));
        // parameters.effects.list.forEach(effect => {
        //     if(effect.value != "")
        //         query.push(this.#writeQueryListCondition(effect, mockCard => mockCard.effects, mockEffect => mockEffect.name));
        // });
        // parameters.abilities.list.forEach(ability => {
        //     if(ability.value != "")
        //         query.push(this.#writeQueryListCondition(ability, mockCard => mockCard.abilities, mockAbility => mockAbility.name));
        // });
        if (parameters.setName.value != "")
            query.push(this.#writeQueryCondition(parameters.setName, mockCard => mockCard.set.name));
        if (parameters.setNumber.value != "")
            query.push(this.#writeQueryCondition(parameters.setNumber, mockCard => mockCard.set.number));
        return `return ${query.join("&&")};`;
    }
    static #writeQueryCondition(parameter, cardFieldFunc) {
        let condition = parameter.condition;
        let value = parameter.value;
        let fieldName = `card.${Util.nameOfField(cardFieldFunc)}`;
        switch (condition) {
            case "equal":
                return `${fieldName} == "${value}"`;
            case "notEqual":
                return `${fieldName} != "${value}"`;
            case "greaterThan":
                return `${fieldName} > "${value}"`;
            case "greaterThanOrEqual":
                return `${fieldName} >= "${value}"`;
            case "lessThan":
                return `${fieldName} < "${value}"`;
            case "lessThanOrEqual":
                return `${fieldName} <= "${value}"`;
            case "match":
                return `${fieldName}.match(/${value}/i)`;
            case "notMatch":
                return `!${fieldName}.match(/${value}/i)`;
        }
    }
    static #writeQueryListCondition(parameter, cardFieldFunc, findFieldFunc) {
        let condition = parameter.condition;
        let value = parameter.value;
        let fieldName = `card.${Util.nameOfField(cardFieldFunc)}.find(x => x.${Util.nameOfField(findFieldFunc)} == "${value}")`;
        switch (condition) {
            case "equal":
                return `${fieldName}`;
            case "notEqual":
                return `!${fieldName}`;
            default:
                return "";
        }
    }
    static #writeQueryString(parameters) {
        let params = new Map();
        parameters.forEach(parameter => {
            if (parameter.value == "")
                return;
            let key = parameter.paramName;
            let values = params.get(key);
            if (values == null) {
                values = [];
                params.set(key, values);
            }
            values.push(`${parameter.condition}:${parameter.value}`);
        });
        return [...params.keys()].map(name => `${name}="${params.get(name).join(";")}"`)
            .join("&");
    }
}
class QueryStringSearchParameter {
    name;
    value;
}
