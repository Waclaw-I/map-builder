import TRANSLATIONS_EN from '../../translations/en.json';
import TRANSLATIONS_PL from '../../translations/pl.json';
import { Language } from './Enums';

const DEFAULT_LANG = Language.EN;

export class Translation {

    private translations: Record<Language, any>;
    private language: Language;

    constructor(language: Language = Language.EN) {
        this.initTranslations();
        this.language = this.isLanguageAvailable(language) ? language : DEFAULT_LANG;
    }

    public get(key: string, substitutions: any = []): string {
        substitutions = this.normalizeSubstitutions(substitutions);
        const langValue: string = this.getLangValue(key);
        return this.substitute(langValue, substitutions);
    }

    public has(key: string): boolean {
        if (this.translations[this.language].hasOwnProperty(key)) {
            return true;
        }
        if (this.translations[DEFAULT_LANG].hasOwnProperty(key)) {
            return true;
        }
        return false;
    }

    private initTranslations(): void {
        this.translations = {
            [Language.EN]: TRANSLATIONS_EN,
            [Language.PL]: TRANSLATIONS_PL,
        };
    }

    private isLanguageAvailable(langauge: Language): boolean {
        return this.translations.hasOwnProperty(langauge);
    }
    
    private getLangValue(key: string): string {
        if (this.translations[this.language].hasOwnProperty(key)) {
            return this.translations[this.language][key];
        }
        if (this.translations[DEFAULT_LANG].hasOwnProperty(key)) {
            return this.translations[DEFAULT_LANG][key];
        }
        return key;
    }

    private substitute(langValue: string, substitutions: string[]): string {
        const matches: string[] = this.getMatches(langValue);
        return matches.reduce((langValue, match) => {
            const index = this.getIndexFromMatch(match);
            const substitution = this.getSubstitution(substitutions, index);
            return langValue.replace(new RegExp(this.escapeRegExp(match), 'g'), substitution);
        }, langValue);
    }

    private getMatches(langValue: string): string[] {
        const matches = langValue.match(/{\d+}/g);
        if (!matches) {
            return [];
        }
        return [ ...new Set(matches) ];
    }

    private getIndexFromMatch(match: string): number {
        return parseInt(match.replace('{', '').replace('}', ''), 10);
    }

    private getSubstitution(substitutions: string[], index: number): string {
        if (!substitutions || substitutions.length <= index) {
            return '';
        }
        return substitutions[index];
    }

    private escapeRegExp(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    private normalizeSubstitutions(substitutions: any): string[] {
        if (typeof substitutions === 'string') {
            return [ substitutions ];
        }
        if (typeof substitutions === 'number') {
            return [ String(substitutions) ];
        }
        return substitutions.map(substitution => {
            if (typeof substitution === 'number') {
                substitution = String(substitution);
            }
            return substitution;
        });
    }

    public getLanguage(): Language {
        return this.language;
    }

    public setLanguage(language: Language): void {
        this.language = language;
    }
}
