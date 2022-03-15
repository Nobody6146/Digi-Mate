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
    parameterTypes;
    types;
    list = [];
    constructor() {
        let enums = App.cardDatabase.cardEnums;
        this.types = [];
        const mockCard = new DigimonTradingCard();
        const mockEffect = new DigimonTradingCardEffect();
        const mockAbility = new DigimonTradingCardAbility();
        this.types.push(new TextSearchParameter("cardName", mockCard => mockCard.name, null, "Card Name", "Any words in the name, e.g. Agumon"));
        this.types.push(new TextSearchParameter("fullText", mockCard => mockCard.fullText, null, "Text", "Any words in the name, e.g. trash, Digimon, etc."));
        this.types.push(new SelectSearchParameter("cardType", mockCard => mockCard.type, null, "Card Type", enums.types.map(type => new KeyValuePair(type, type))));
        this.types.push(new SelectSearchParameter("attribute", mockCard => mockCard.attribute, null, "Attribute", enums.attributes.map(attribute => new KeyValuePair(attribute, attribute))));
        this.types.push(new SelectSearchParameter("color", mockCard => mockCard.color, null, "Color", enums.colors.map(color => new KeyValuePair(color, color))));
        this.types.push(new SelectSearchParameter("form", mockCard => mockCard.form, null, "Form", enums.forms.map(form => new KeyValuePair(form, form))));
        this.types.push(new NumberSearchParameter("level", mockCard => mockCard.level, null, "Level", "Any numerical value, e.g. 3"));
        this.types.push(new NumberSearchParameter("playCost", mockCard => mockCard.playCost, null, "Play Cost", "Any numerical value, e.g. 3"));
        this.types.push(new NumberSearchParameter("evolutionCost", mockCard => mockCard.evolutionCost, null, "Evolution Cost", "Any numerical value, e.g. 3"));
        this.types.push(new SelectSearchParameter("rarity", mockCard => mockCard.rarity, null, "Rarity", enums.rarities.map(rarity => new KeyValuePair(rarity, rarity))));
        this.types.push(new TextSearchParameter("artist", mockCard => mockCard.artist, null, "Artist", "Any words in the name, e.g. shosuke"));
        this.types.push(new NumberSearchParameter("dp", mockCard => mockCard.dp, null, "DP", "Any numerical value, e.g. 3"));
        this.types.push(new SelectSearchParameter("digimonType", mockCard => mockCard.digimonType, null, "Digimon Type", enums.digimonTypes.map(type => new KeyValuePair(type, type))));
        this.types.push(new TextSearchParameter("number", mockCard => mockCard.number, null, "Card Number", "Any words in the name, e.g. BT1-041"));
        this.types.push(new SelectSearchParameter("effect", mockCard => mockCard.effects, mockEffect => mockEffect.name, "Effect", enums.effects.map(effect => new KeyValuePair(effect.name, effect.name))));
        this.types.push(new SelectSearchParameter("ability", mockCard => mockCard.abilities, mockAbility => mockAbility.name, "Ability", enums.abilities.map(ability => new KeyValuePair(ability.name, ability.name))));
        this.types.push(new SelectSearchParameter("setName", mockCard => mockCard.set.name, null, "Set Name", enums.setNames.map(name => new KeyValuePair(name, name))));
        this.types.push(new SelectSearchParameter("setNumber", mockCard => mockCard.set.number, null, "Set Number", enums.setNumbers.map(num => new KeyValuePair(num, num))));
        this.parameterTypes = new Map();
        this.types.forEach(type => this.parameterTypes.set(type.parameterType, type));
        this.list = this.types.map(x => AppSearchParameters.copy(x));
    }
    static copy(parameter) {
        let result = JSON.parse(JSON.stringify(parameter));
        result.fieldFunction = parameter.fieldFunction;
        result.findFieldFunction = parameter.findFieldFunction;
        return result;
    }
}
class SearchParameter {
    fieldName;
    parameterType;
    templateType;
    fieldFunction;
    findFieldFunction;
    //paramName:string;
    placeholder;
    value;
    availableConditions;
    condition;
    constructor(templateType, parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value = "", condition = "equal") {
        this.templateType = templateType;
        this.fieldName = fieldName;
        this.parameterType = parameterType;
        this.fieldFunction = fieldFunction;
        this.findFieldFunction = findFieldFunction;
        //this.paramName = this.fieldName.replace(" ", "").toLowerCase();
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
    constructor(parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value = "") {
        super("TextSearchTemplate", parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value, "match");
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual"),
            new KeyValuePair("Includes", "match"),
            new KeyValuePair("Excludes", "notMatch"),
        ];
    }
}
class NumberSearchParameter extends SearchParameter {
    constructor(parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value = "") {
        super("NumberSearchTemplate", parameterType, fieldFunction, findFieldFunction, fieldName, placeHolder, value, "equal");
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
    constructor(parameterType, fieldFunction, findFieldFunction, fieldName, options, value = "") {
        super("SelectSearchTemplate", parameterType, fieldFunction, findFieldFunction, fieldName, "", value, "equal");
        this.options = options;
        this.availableConditions = [
            new KeyValuePair("=", "equal"),
            new KeyValuePair("!=", "notEqual")
        ];
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
        if (window.location.search != "") {
            App.search.query = window.location.search;
            App.queryCardDatabase(App.hydrate.state(App.search));
        }
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
        let search = App.hydrate.state(App.search);
        let textQuery = this.writeQueryString(search.parameters);
        search.query = textQuery;
        return this.queryCardDatabase(search);
    }
    static queryCardDatabase(appSearch) {
        let textQuery = appSearch.query;
        textQuery = decodeURI(textQuery);
        if (textQuery.charAt(0) === "?")
            textQuery = textQuery.substring(1);
        let query = this.parseQueryString(appSearch);
        let filter = new Function("card", `return ${query};`);
        let results = [...this.#cards.values()].filter(card => filter(card));
        this.search.results = results;
        this.search.query = textQuery;
        return results;
    }
    static writeQueryString(searchParameters) {
        let params = new Map();
        searchParameters.list.forEach(parameter => {
            if (parameter.value == "")
                return;
            let key = parameter.parameterType;
            let values = params.get(key);
            if (values == null) {
                values = [];
                params.set(key, values);
            }
            values.push(`${parameter.condition}:${parameter.value}`);
        });
        let queryString = [...params.keys()].map(name => `${name}=${params.get(name).join(";")}`)
            .join("&");
        return encodeURI(queryString);
    }
    static parseQueryString(appSearch) {
        let expressions = [];
        decodeURI(appSearch.query).split("&").forEach(token => {
            let [, parameterName, parameterValue] = token.match(/([^=]+)=(.*)/);
            let parameter = appSearch.parameters.parameterTypes.get(parameterName);
            if (parameter == null)
                return;
            let [, condition, value] = parameterValue.match(/([^:]+):(.*)/);
            let expression = parameter.findFieldFunction == null
                ? this.writeQueryCondition(condition, value, parameter.fieldFunction)
                : this.writeQueryListCondition(condition, value, parameter.fieldFunction, parameter.findFieldFunction);
            expressions.push(expression);
        });
        return expressions.join("&&");
    }
    static writeQueryCondition(condition, value, cardFieldFunc) {
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
    static writeQueryListCondition(condition, value, cardFieldFunc, findFieldFunc) {
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
}
class QueryStringSearchParameter {
    name;
    value;
}
