import { Language } from '../Enums';

export class TypesHelper {

    public static getPossibleLanguageFromString(langString: string): Language | undefined {
        if (langString.includes('pl') || langString.includes('PL')) {
            return Language.PL;
        }
        if (langString.includes('en') || langString.includes('EN') || langString.includes('US')) {
            return Language.EN;
        }
        return undefined;
    }

    public static isStringOfLanguageType(language: string): language is Language {
        const languages: string[] = [
            Language.EN,
            Language.PL,
        ];
        return languages.includes(language);
    }
}
