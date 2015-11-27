{
    'Translators canTranslate DocumentsNeedingTranslation': {},
    'Translators canTranslate documentsNeedingTranslation': {
        documentsNeedingTranslation: {
            modelName: 'Document',
            restriction: function (_, document) {
                return document.translations.length < 2;
            }
        }
    },
    'anybody canEdit TheirStuff': {},
    'anybody canEdit theirStuff': {
        anybody: 'User',
        theirStuff: {
            modelName: /.*/,
            restriction: function (anybody, theirStuff) { 
                return theirStuff.owner_id && (theirStuff.owner_id == anybody.id);
            }
        }
    },
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