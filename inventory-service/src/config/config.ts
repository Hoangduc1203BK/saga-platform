import { join } from "path";
import {dir} from '../const/const';
import {Service} from "typedi";

@Service()
export class Config{
    constructor(){}

    private getNumber(key: string): any{
        const value=process.env[key];
        if(Number(value)){
            return Number(value);
        }else{
            throw new Error(`${key} not is number`)
        }
    }

    private getString(key: string):any{
        const value=process.env[key];
        return value
    }


    get DbOptions(){
        
        return {
            type:this.getString('TYPE'),
            username:this.getString('USER'),
            port:this.getNumber('PORT_PG'),
            host:this.getString('HOST'),
            password:this.getString('PASSWORD'),
            database:this.getString('DATABASE'),
            entities: [`${join(__dirname,dir.entities)}/**/*.{js,ts}`],
            synchronize: false,
        }
    }
}