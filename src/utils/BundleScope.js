import { blank } from './object';


// Given an element of a BundleScope's `names` array,
// return true if the name can be changed.
function isChangableName ( name ) {
  return typeof name !== 'number' && name.constructor !== FixedName;
}


class InternalName {
  constructor ( module, name ) {
    this.module = module;
    this.original = name;
    this.name = name;
    this.modified = false;
  }

  fullname () {
    switch ( this.original ) {
      case 'default': return this.name;
      case '*': return this.module.name;
    }

    return `${this.module.name}.${this.name}`;
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

class FixedName extends InternalName {}

class ExternalName extends InternalName {
  get ( localName, direct ) {
    return direct ? this.name : this.fullname();
  }
}

export default class BundleScope {
  constructor () {
    // Array of names (inheriting from InternalName) and numbers (references).
    this.names = [];

    this.entry = null;

    // The names that are in use within the scope of the bundle.
    this.inUse = blank();

    // Implicitly expect exports to always exist.
    // Simplifies deconflicting logic.
    this.inUse[ 'exports' ] = '<Implicit Module "exports">';
  }

  add ( name ) {
    return this.names.push( name ) - 1;
  }

  // Add a name which must remain the same.
  // TODO: rename `addGlobal( name: string )`?
  addFixed ( name ) {
    // TODO: make sure the name isn't already in use.
    this.inUse[ name.name ] = name;
    return this.names.push( name ) - 1;
  }

  // Creates a new internal module called `name`.
  internalModule ( name ) {
    const mod = new ModuleScope( this, name, InternalName );

    if ( !this.entry ) {
      this.entry = mod;
      mod.isEntry = true;
    }

    return mod;
  }

  // Creates a ModuleScope for an external module,
  // that uses an unused name like `name`.
  externalModule ( name ) {
    name = this.unusedNameLike( name, undefined );
    this.inUse[ name ] = `<External Module "${name}">`;
    return new ModuleScope( this, name, ExternalName );
  }

  deconflict () {
    // Try to bind the exports as directly to the exports as possible.
    // TODO: See export-from-renamed, optimize to: `exports.y = 42;`

    // Deconflict all changable names in the bundle's scope.
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
    if (typeof ref !== 'number' ) throw new Error(`Ref must be number!`);
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

    // Is set to true for the EntryModule in `BundleScope.internalModule`.
    this.isEntry = false;

    // The Name constructor used by the module to create its names.
    this.Name = Name;

    // Mappings from local and exported names to global name ids.
    this.localNames = blank();
    this.exportedNames = blank();

    // HACK: :(
    this.module = null;
  }

  add ( name ) {
    if ( typeof name !== 'string' )
      throw new TypeError(`ModuleScope.add got a non-string '${name}'!`);

    // Don't redefine the name.
    if ( name in this.localNames ) return;

    return ( this.localNames[ name ] = this.parent.add( new this.Name( this, name ) ) );
  }

  addFixed ( name ) {
    this.localNames[ name ] = this.parent.addFixed( new FixedName( this, name ) );
  }

  // Add an export called `name` which refers to the variable `ref`.
  export ( name, ref ) {
    if ( typeof ref === 'undefined' ) throw new Error('need ref');
    if ( typeof ref !== 'number' ) throw new Error(`Ref should be number, got ${typeof ref}!`);

    if ( name in this.exportedNames ) {
      if ( this.exportedNames[ name ] !== null ) {
        throw new Error(`Re-exported '${name}'`);
      } else {
        this.parent.set( this.exportedNames[ name ], ref );
      }
    }

    this.exportedNames[ name ] = this.parent.add( ref );
  }

  get ( name, direct ) {
    return this.parent.get( this.getRef( name ), name, direct ) || (console.log(this.parent.names) || null);
  }

  getExport ( name ) {
    return this.parent.resolveName( this.getExportRef( name ) );
  }

  getExportName ( name, direct ) {
    const resolved = this.parent.resolveName( this.getExportRef( name ) );

    if ( resolved.module.isEntry ) {
      return 'exports.' + resolved.get( name, direct );
    }

    return resolved.get( name, direct );
    // return ( direct || !this.isEntry ? '' : 'exports.' ) +
    //   this.parent.get( this.getExportRef( name ), name, true );
  }

  getExportRef ( name ) {
    if ( !( name in this.exportedNames ) ) {
      if ( this.Name === ExternalName ) { // is external module
        // TODO: should it be `new this.Name( this, name )` instead of `this.add( name )`?
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
    return name in this.exportedNames;
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

  // TODO: remove if possible.
  renameScope( name ) {
    // No renaming takes place. :)
    if ( name === this.name ) return;

    console.warn(`I don't like renaming modules...`);
    const usage = this.parent.inUse[ this.name ];
    delete this.parent.inUse[ this.name ];
    const similarName = this.parent.unusedNameLike( name, usage );

    if ( similarName !== name ) {
      throw new Error(`Scope renaming '${this.name}' to '${name}' results in collision!`);
    }

    this.name = name;
    this.parent.inUse[ name ] = usage;
  }

  suggest ( name, suggestion ) {
    const ref = this.getRef( name );

    this.parent.suggest( ref, suggestion );

    return ref;
  }

  unlink ( name ) {
    this.parent.set(this.localNames[ name ], new this.Name( this, name ) );
  }
}

// debug(ModuleScope);

//jshint unused: false
function debug (cls) {
  Object.keys(cls.prototype).forEach( name => {
    const m = cls.prototype[ name ];

    cls.prototype[ name ] = function () {
      console.log(`ModuleScope<${this.name}>::${name}(${[].join.call(arguments, ', ')})`);
      const res = m.apply(this, arguments);

      if (res !== undefined)
        console.log(`\t-> ${res}`);

      return res;
    };
  });
}
