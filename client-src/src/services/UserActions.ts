import { defineComponent } from 'vue';
import type { MethodOptions } from 'vue';
import type { RouteRecordNormalized } from 'vue-router';

import { AList } from "../services/AList";
import { CacheWrapper } from "../workers/InstallWorker";
import { StaticRoutes } from "./Routing";
import { hashState } from '../../../common/util';
import { useUIText } from "../services/Localisation";
import type { FactoryArtefact } from "../services/DataFactory";
import type { COMPLETE_STORE } from '../services/Store';
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";


export type UserAction=function (e: GuessEvent): boolean;
// IOIO this type is abit of a hack...
export type DefinedComponent = ReturnValue<defineComponent>;
export interface ExternalMethods {
  mount(bound:Array<UserAction>, obj:DefinedComponent ):MethodOptions;
}

// this has params to make buiding unit-tests easier.
export function useUserActions(a:shopStore, b:FactoryArtefact, c:CacheWrapper, d:RouteRecordNormalized  ):ExternalMethods {
  return new UserActions( d, a, c, b );
}

const TEXT = useUIText();
class UserActions {
    protected store:COMPLETE_STORE;
    protected route:RouteRecordNormalized;
    protected cache:CacheWrapper;
    protected data:FactoryArtefact;

    protected loadedStateKey:string;


    // not injected: StaticRoutes
    public constructor(rr:RouteRecordNormalized, ss:COMPLETE_STORE, ca:CacheWrapper, ld:FactoryArtefact, ):UserActions {
        this.route=rr;
        this.store=ss;
        this.cache=ca;
        this.data=ld;
        this.loadedStateKey=hashState( this.data.currentData.list() );
        
        if(! this.route) { throw new Error("The vue Route isn't present"); }
        if(! this.store ) { throw new Error("The Store of ShopState isn't present"); }
        if(! this.cache) { throw new Error("The CacheWrapper isn't present"); }
        if(! this.data) { throw new Error("The Data Factory isn't present"); }
    }

    mount(bound:Array<UserAction>, obj:DefinedComponent ):MethodOptions {
       let ret={};
       for(let i =0; i<bound.length; i++) {
        ret[ bound[i].name ]=this.wrapper(bound[i].bind(obj), false);
       }
       ret.onIntersitial=this.wrapper(this.onIntersitial, true);
        ret.onInstall=this.wrapper(this.onInstall, true);
        ret.onUnique=this.wrapper(this.onUnique, true);
        ret.onDuplicate=this.wrapper(this.onDuplicate, true);
        ret.onSave=this.wrapper(this.onSave, true);
        ret.onRevert=this.wrapper(this.onRevert, true);
        ret.onSearch=this.wrapper(this.onSearch, true);
       return ret;
    }

    wrapper(f1:UserAction, bind:boolean):UserAction {
        return function( e: GuessEvent): boolean {
           if (e.type && e.type === "mouseup") {
             return false;
           }
           if (!this.data.currentData) {
             return false;
           }
           bind && f1.bind(this);
           f1(e); // return void mostly       
           return false;
        }.bind(this);
    }
    
    // this, onMenu and onName need to live in the TabBar
    onSearch(e: GuessEvent): boolean {
       this.CB = (d1: string | null): any => {
        if (d1 === null || d1==="") {
          this.visible = false;
          return;
        }
 
        let newlist=AList.serps( 
            this.data.currentData.searchItems( d1)
            );
        this.visible = false;
        StaticRoutes.push({ name: "serps", state: { payload: newList } });
      };
        this.visible=true;
        return false;
    },    

        onName( ): boolean {
      const liste = this.data.currentData.get(this.store.state.currentId);
      if (!liste) {
        console.warn("EDIT NAME: got bad id, don't know how to proceed");
        return false;
      }
      this.getInput = liste.nom ?? TEXT.get("menu.renameSupport");

      this.CB = (d1: string | null): any => {
        if (d1 === null) {
          this.visible = false;
          return;
        }
        if (!this.store) {
          throw new Error("2357675675357578 Impossible");
        }
        liste.editName(d1);
        this.data.currentData.put(this.store.state.currentId, liste);
        this.visible = false;
        StaticRoutes.push({ name: "list-everything" });
      };
      this.visible = true;
      return false;
    }



   onIntersitial():void {
      console.log("Trying to show help", this.route.path);
      if (this.store.state.currentURL !== this.route.path) {
        console.warn("The state.currentURL hasn't updated!", this.store.state.currentURL, this.route.path);
        this.store.commit("setPath", this.route.path);
      }
      this.store.commit("show", true);
    }

    onInstall():boolean {
      if (location.protocol !== "https:") {
        console.warn("Install button is disabled, you need to use HTTPS.");
        return false;
      }
      if (this.CACHE.check()) {
        console.warn("App thinks its already installed.");
        return false;
      }

      console.log("Trying to install App to local device.");
      this.CACHE.install();
      return false;
    }

    onUnique(): void {
      const liste = this.data.currentData.get(this.store.state.currentId);
      if (liste) {
        liste.unique();
        this.data.currentData.put(this.store.state.currentId, liste);
      }
    }

    onDuplicate(): void {
      const liste = this.data.currentData.get(this.store.state.currentId);

      if (liste) {
        const extra = Object.assign(AList.manual(`DUP: ${liste.nom}`, this.data.currentData.count()), liste);
        extra.editName(`DUP: ${liste.nom}`);
        this.data.currentData.append(extra);
      }
      StaticRoutes.push({ name: "list-everything" });
    }

    onSave(): boolean {
      if( this.loadedStateKey===hashState(this.data.currentData.list()) ) {
        console.log("Data is identical as last save ");
        return false;
      }

      console.log("Saving list to local cache list, for all lists");
      this.loadedStateKey=hashState(this.data.currentData.list());
      this.data.currentData.saveAllLists();
      return false;
    },

    onRevert(): boolean {
      if( this.loadedStateKey===hashState(this.data.currentData.list()) ) {
        console.log("Data is identical to initial state ");
        return false;
      }
      console.log("Rebuilding data from cache for all lists");
      this.data.currentData.loadAllLists();
      return false;
    },

   

}    