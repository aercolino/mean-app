{
    // This is an example of permission using roles for the subject and the object.

    // Notice that 
    // -- the key is at the same time a unique name and a description of the permission.
    // -- roles are in UpperCamelCase and items are in lowerCamelCase.
    // -- actions are always 'can' + UpperCamelCase. This is currently enforced in code.
    // -- the format is always SUBJECT ACTION OBJECT.
    
    // Notice that in this case 
    // -- the definition must be an empty object. 

    'Translators canTranslate DocumentsNeedingTranslation': {},



    // This is an example of permission using a role for the subject and an item for the object.

    // Notice that 
    // -- the specification entails both a modelName and a restriction.
    // -- the restriction always receives two arguments: the subject and the object.

    // Notice that in this case 
    // -- the definition must specify only the item for the object. 

    'Translators canTranslate documentsNeedingTranslation': {
        documentsNeedingTranslation: {
            modelName: 'Document',
            restriction: function (_, document) {
                return document.translations.length < 2;
            }
        }
    },



    // This is an example of permission using an item for the subject and a role for the object.

    // Notice that 
    // -- if there is no restriction, then the specification can be simpler.

    // Notice that in this case 
    // -- the definition must specify only the item for the subject.

    'anybody canEdit TheirStuff': {
        anybody: 'User'
    },



    // This is an example of permission using items for the subject and the object.

    // Notice that in this case 
    // -- the definition must specify both the items for the subject and the object.
    // -- theirStuff is an implementation of Duck Typing.

    'anybody canEdit theirStuff': {
        anybody: 'User',
        theirStuff: {
            modelName: /.*/,
            restriction: function (anybody, theirStuff) { 
                return theirStuff.owner_id && (theirStuff.owner_id == anybody.id);
            }
        }
    },



    // This is an example of permission using items for the subject and the object.

    // Notice that 
    // -- as a policy, a given subject/object A matches a string or a regular expression definition X iif A.replace(X, '') === ''.

    // Notice that in this case 
    // -- a match-all RegExp for the action and the object makes this permission quite generic.

    'anyAdmin canDo everything': {
        anyAdmin: {
            modelName: 'User',
            restriction: function (anyAdmin) {
                return anyAdmin.isAdmin;
            }
        },
        canDo: /.*/,
        everything: /.*/
    }
}