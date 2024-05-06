module MyNFT::init_module_collection{
    use std::option;
    use std::signer;
    use std::signer::address_of;
    use std::string;
    use aptos_std::string_utils;
    use aptos_framework::account;
    use aptos_framework::account::SignerCapability;
    use aptos_framework::object;
    use aptos_framework::object::Object;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use aptos_token_objects::token::Token;

    // collection information
    const CollectionDescription:vector<u8> = b"collection_description";
    const CollectionName:vector<u8> = b"collection_name";
    const CollectionURI:vector<u8> = b"https://caoyang2002.top/images/gclx/bird.png";

    // token information
    const TokenDescription:vector<u8> = b"token_description";
    const TokenName:vector<u8> = b"token_name";
    const TokenURI:vector<u8> = b"https://caoyang2002.top/images/gclx/";
    const TokenPrefix:vector<u8> = b"number #";

    // create a resource account seed
    const ResourceAccountSeed:vector<u8> = b"seed";


    struct ResourceCap has key{
        cap:SignerCapability
    }
    struct CollectionRefsStore has key{
        collection_mutator_ref:collection::MutatorRef
    }
    struct TokenRefsStore has key{
        token_mutator_ref: token::MutatorRef,
        token_burn_ref: token::BurnRef,
    }

    fun init_module(creator: &signer){
        // create a resource account
        let (resource_signer,resource_cap) = account::create_resource_account(creator,ResourceAccountSeed);
        move_to(&resource_signer,ResourceCap{cap:resource_cap});
        // collection
        let max_supply = 10;
        let collection_constructor_ref = collection::create_fixed_collection(
            &resource_signer,
            string::utf8(CollectionDescription),
            max_supply,
            string::utf8(CollectionName),
            option::none(),
            string::utf8(CollectionURI),
        );

        // create collection mutator
        let collection_signer = object::generate_signer(&collection_constructor_ref);
        let collection_mutator_ref = collection::generate_mutator_ref(&collection_constructor_ref);
        move_to(&collection_signer,CollectionRefsStore{collection_mutator_ref})
    }

    public entry fun mint(creator:&signer)acquires ResourceCap {
        // borrow signer capability
        let resource_cap = &borrow_global<ResourceCap>(account::create_resource_address(&@MyNFT,ResourceAccountSeed)).cap;
        let resource_signer = &account::create_signer_with_capability(resource_cap);
        let token_constructor_ref = token::create_numbered_token(
            resource_signer,
            string::utf8(CollectionName),
            string::utf8(TokenDescription),
            string::utf8(TokenPrefix),
            string::utf8(b""),
            option::some(royalty::create(1,1,address_of(resource_signer))),
            string::utf8(b""),
        );
        let url = string::utf8(TokenURI);
        let id = token::index<Token>(object::object_from_constructor_ref(&token_constructor_ref));
        string::append(&mut url,string_utils::to_string(&id));
        string::append(&mut url, string::utf8(b".png"));
        let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
        token::set_uri(&token_mutator_ref,url);
        let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
        let token_burn_ref = token::generate_burn_ref(&token_constructor_ref);
        let token_signer = object::generate_signer(&token_constructor_ref);
        move_to(
            &token_signer,
            TokenRefsStore{
                token_mutator_ref,
                token_burn_ref,
            }
        );
        object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token_constructor_ref),
            signer::address_of(creator)
        )
    }

    /// No ownership
    const ERROR_NO_OWNERSHIP:u64 = 404;
    public entry fun burn(creator:&signer,object:Object<Token>) acquires TokenRefsStore {
        assert!(object::is_owner(object,signer::address_of(creator)),ERROR_NO_OWNERSHIP);
        let TokenRefsStore{
            token_mutator_ref: _,
            token_burn_ref
        } = move_from<TokenRefsStore>(object::object_address(&object));
        token::burn(token_burn_ref);
    }

}
