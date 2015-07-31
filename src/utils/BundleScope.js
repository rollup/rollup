import { blank } from './object';


function isChangableName ( name ) {
  return name.constructor === InternalName;
}


class InternalName {
  constructor ( moduleName, name ) {
    this.moduleName = moduleName;
    this.original = name;
    this.name = name;
  }

  get ( direct ) { //jshint unused: false
    return this.name;
  }
}

class FixedName extends InternalName {
  constructor ( moduleName, name ) {
    super( moduleName, name );
    Object.defineProperty(this, 'name', {
      get: () => name,
      set: () => { throw new Error(`Can't set name of FixedName!`); }
    });
  }
}

class ExternalName extends InternalName {
  get ( direct ) {
    if ( direct ) return this.name;

    return this.name === 'default' ?
      `${this.moduleName}['default']` :
      `${this.moduleName}.${this.name}`;
  }
}

class ExportName extends ExternalName {
  constructor ( name ) {
    super( 'exports', name );
    this.reassigned = false;
  }

  get ( direct ) {
    if ( this.reassigned ) {
      return super.get( direct );
    }

    return this.name;
  }
}

class ReferenceName {
  constructor ( scope, id ) {
    this.scope = scope;
    this.id = id;
  }

  deref () {
    return this.scope.names[ this.id ];
  }

  get original () {
    return this.deref().original;
  }

  get name () {
    return this.deref().name;
  }

  set name ( value ) {
    this.deref().name = value;
  }

  get ( direct ) {
    return this.deref().get( direct );
  }
}


export default class BundleScope {
  constructor () {
    this.names = [];
    this.inUse = blank();

    this.children = blank();
  }

  add ( name ) {
    return this.names.push( name ) - 1;
  }

  // Add a name which must remain the same.
  addFixed ( name ) {
    this.inUse[ name.name ] = name;
    return this.names.push( name ) - 1;
  }

  // Creates a new child called `name`.
  child ( name ) {
    return (this.children[ name ] = new ModuleScope( this, name, InternalName ));
  }

  exportScope () {
    return this.externalChild( 'exports' );
  }

  externalChild ( name ) {
    return (this.children[ name ] = new ModuleScope( this, name, ExternalName ));
  }

  deconflict () {
    this.names.filter( isChangableName ).forEach( n => {
      let name = n.name;

      while ( name in this.inUse && this.inUse[ name ] !== n ) {
        name = '_' + name;
      }

      this.inUse[ name ] = n;

      n.name = name;
    });
  }

  get ( nameId, direct ) {
    const name = this.names[ nameId ];

    if ( !name ) throw new Error(`No name found with id ${nameId}!`);

    return name.get( direct );
  }

  link ( nameId, otherId ) {
    this.names[ nameId ] = Object.create( otherId );
  }

  rename ( nameId, replacement ) {
    const name = this.names[ nameId ];

    if ( !name ) {
      console.error('No name with:', nameId);
    }

    name.name = replacement;
  }

  suggest ( nameId, suggestion ) {
    const name = this.names[ nameId ];

    if ( name.name === name.original ) {
      name.name = suggestion;
    }
  }
}

class ModuleScope {
  constructor ( parent, name, Name ) {
    if (!name) throw new Error(`ModuleScope needs name, got '${name}'.`);

    this.parent = parent;
    this.name = name;

    this.Name = Name;

    // Mapping from local name to global name id.
    this.localNames = blank();
  }

  add ( name ) {
    // Don't redefine the name.
    if ( name in this.localNames ) return;

    this.localNames[ name ] = this.parent.add( new this.Name( this.name, name ) );
  }

  addFixed ( name ) {
    this.localNames[ name ] = this.parent.addFixed( new FixedName( this.name, name ) );
  }

  get ( name, direct ) {
    const res = this.parent.get( this.getRef( name ), direct );
    // console.log(`// NS: Get ${this.name}.${name} == '${res}'`);
    return res;
  }

  getRef ( name ) {
    if ( !( name in this.localNames ) ) {
      this.add( name );
    }

    const ref = this.localNames[ name ];
    // console.log(`//     &${this.name}.${name} == '${ref}'`);
    return ref;
  }

  // Link the local name `name` of this module,
  // to another modules name reference `ref`.
  link ( name, ref ) {
    if ( name in this.localNames ) throw new Error(`Name ${name} is already bound!`);

    // if ( typeof ref === 'string' ) ref = this.getRef( ref );

    // console.log(`// NS: Linking ${this.name}.${name} <--> '${ref}'!`);
    this.localNames[ name ] = this.parent.add( new ReferenceName( this.parent, ref ) );
  }

  // Exports the local name `name` from this module.
  export ( name ) {
    if ( name in this.localNames ) throw new Error(`Name ${name} is already bound!`);

    this.localNames[ name ] = this.parent.add( new ExportName( name ) );
  }

  rename ( name, replacement ) {
    // console.log(`// NS: Renaming ${this.name}.${name} ~~~> '${replacement}'!`);
    this.localNames[ name ].name = replacement;
    // this.parent.rename( this.getRef( name ), replacement );
  }

  suggest ( name, suggestion ) {
    // console.log(`// NS: Suggesting ${this.name}.${name} -?-> '${suggestion}'!`);
    this.parent.suggest( this.getRef( name ), suggestion );
  }
}
