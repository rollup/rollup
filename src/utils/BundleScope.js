import { blank } from './object';


function isChangableName ( name ) {
  return name.constructor === InternalName || name.constructor === ExternalName;
}


class InternalName {
  constructor ( moduleName, name ) {
    this.moduleName = moduleName;
    this.original = name;
    this.name = name;
    this.modified = false;
  }

  fullname () {
    switch ( this.original ) {
      case 'default': return this.name;
      case '*': return this.moduleName;
    }
    return `${this.moduleName}.${this.name}`;
  }

  get ( localName, direct ) { //jshint unused: false
    return this.name;
  }

  isSpecial () {
    return this.original === 'default' || this.original === '*';
  }

  modify () {
    this.modified = true;
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
  get ( localName, direct ) {
    if ( direct ) {
      return this.name === 'default' ?
        localName : this.name;
    }

    return this.fullname();
  }
}

class ExportName extends ExternalName {
  constructor ( name ) {
    super( 'exports', name );
  }

  // TODO: maybe diffrentiate on reassignment.
  // get ( direct ) {
  //   if ( this.modified ) {
  //     return super.get( direct );
  //   }
  //
  //   return this.name;
  // }
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
    // TODO: make sure the name isn't already in use.
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
    name = this.unusedNameLike( name, undefined );
    this.inUse[ name ] = `<External Module "${name}">`;
    return (this.children[ name ] = new ModuleScope( this, name, ExternalName ));
  }

  deconflict () {
    this.names.filter( isChangableName ).forEach( name => {
      // TODO: make a better check for when a sole 'default'/'*' import can
      // use the name of the module.
      if ( name.constructor === ExternalName && name.isSpecial() )
        return;

      const newName = this.unusedNameLike(name.name, name);

      this.inUse[ newName ] = name;

      name.name = newName;
    });
  }

  get ( nameId, localName, direct ) {
    const name = this.resolveName( nameId );

    if ( !name ) throw new Error(`No name found with id ${nameId}!`);

    return name.get( localName, direct );
  }

  isExported ( nameId ) {
    return this.resolveName( nameId ) instanceof ExportName;
  }

  modify ( nameId ) {
    this.resolveName( nameId ).modify();
  }

  resolveName ( ref ) {
    while ( typeof ref === 'number' ) {
      ref = this.names[ ref ];
    }

    return ref;
  }

  resolveReference ( ref ) {
    while ( typeof this.names[ ref ] === 'number' ) {
      ref = this.names[ ref ];
    }

    if ( ref < 0 || ref >= this.names.length ) {
      throw new Error(`Invalid name reference!`);
    }

    return ref;
  }

  set ( ref, name ) {
    if ( ref < 0 || ref >= this.names.length ) {
      throw new Error(`Invalid name reference '${ref}'!`);
    }

    this.names[ ref ] = name;
  }

  suggest ( nameId, suggestion ) {
    const name = this.resolveName( nameId );

    if ( name.name === 'default' || name.name === '*' ) {
      name.name = suggestion;
    }
  }

  unusedNameLike ( name, x ) {
    while ( name in this.inUse && this.inUse[ name ] !== x ) {
      // console.log(`// Name '${n.moduleName}.${n.name}' in use by`, this.inUse[ name ]);
      name = `_${name}`;
    }

    return name;
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
    this.exportedNames = blank();
  }

  add ( name ) {
    if ( typeof name !== 'string' )
      throw new TypeError(`ModuleScope.add got a non-string '${name}'!`);

    // Don't redefine the name.
    if ( name in this.localNames ) return;

    return ( this.localNames[ name ] = this.parent.add( new this.Name( this.name, name ) ) );
  }

  addFixed ( name ) {
    this.localNames[ name ] = this.parent.addFixed( new FixedName( this.name, name ) );
  }

  // Add an export called `name` which refers to the variable `ref`.
  export ( name, ref ) {
    if ( typeof ref === 'undefined' ) throw new Error('need ref');

    if ( name in this.exportedNames && this.exportedNames[ name ] !== null ) {
      throw new Error(`Re-exported '${name}'`);
    }

    this.exportedNames[ name ] = ref;
  }

  get ( name, direct ) {
    return this.parent.get( this.getRef( name ), name, direct );
  }

  getExportName ( name, direct ) {
    return this.parent.get( this.getExportRef( name ), name, direct );
  }

  getExportRef ( name ) {
    if ( !( name in this.exportedNames ) ) {
      if ( this.Name === ExternalName ) { // is external module
        this.exportedNames[ name ] = this.add( name );
      } else {
        throw new Error(`Module '${this.name}' doesn't export '${name}'.`);
      }
    }

    return this.exportedNames[ name ];
  }

  getRef ( name ) {
    if ( !( name in this.localNames ) ) {
      this.add( name );
    }

    return this.localNames[ name ];
  }

  isExported ( name ) {
    return this.parent.isExported( this.localNames[ name ] );
  }

  isModified ( name ) {
    return this.parent.resolveName( this.getRef( name ) ).modified;
  }

  // Link the local name `name` of this module,
  // to another module's name reference `ref`.
  link ( name, ref ) {
    if ( name in this.localNames ) {
      this.parent.set( this.localNames[ name ], ref );
      return;
    }

    this.localNames[ name ] = this.parent.add( ref );
  }

  modify ( name ) {
    this.parent.modify( this.getRef( name ) );
  }

  suggest ( name, suggestion ) {
    const ref = this.getRef( name );

    this.parent.suggest( ref, suggestion );

    return ref;
  }

  unlink ( name ) {
    this.parent.set(this.localNames[ name ], new this.Name( this.name, name ) );
  }
}

// debug(ModuleScope);

//jshint unused: false
function debug (cls) {
  Object.keys(cls.prototype).forEach( name => {
    console.log( name );
    const m = cls.prototype[ name ];

    cls.prototype[ name ] = function () {
      console.log(`ModuleScope<${this.name}>::${name}(${[].join.call(arguments, ', ')})`);
      return m.apply(this, arguments);
    };
  });
}
