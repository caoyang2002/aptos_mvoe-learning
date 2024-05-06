module MyNFT::diff{
    use std::option;
    use std::signer::address_of;
    use std::string;
    use aptos_std::string_utils;
    use aptos_framework::object;
    use aptos_framework::object::{ConstructorRef, Object};
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use aptos_token_objects::token::{royalty, Token};

    // collection information
    const CollectionDescription:vector<u8> = b"collection_description";
    const CollectionName:vector<u8> = b"collection_new_name";
    const CollectionURI:vector<u8> = b"https://caoyang2002.top/images/gclx/bird.png";
    // token information
    const TokenDescription:vector<u8> = b"token_description";
    const TokenPrefix:vector<u8> = b"prefix_name";
    const TokenSuffix:vector<u8> = b"suffix_name";
    const TokenURI:vector<u8> = b"https://caoyang2002.top/images/gclx/";

    public entry fun create_collection(creator:&signer){
        let max_supply = 12;
        let collection_constructor_ref = collection::create_fixed_collection(
            creator,
            string::utf8(CollectionDescription),
            max_supply,
            string::utf8(CollectionName),
            option::none(),
            string::utf8(CollectionURI)
        );
    }

    struct TokenRefsStore has key{
        burn_ref:token::BurnRef
    }
    public entry fun mint(creator:&signer){
        let token_constructor_ref = token::create_numbered_token(
            creator,
            string::utf8(CollectionName),
            string::utf8(TokenDescription),
            string::utf8(TokenPrefix),
            string::utf8(TokenSuffix),
            option::some(royalty::create(1,1,address_of(creator))),
            string::utf8(b""),
        );
        // set url
        let url = string::utf8(TokenURI);
        let id = token::index<Token>(object::object_from_constructor_ref(&token_constructor_ref));
        string::append(&mut url,string_utils::to_string(&id));
        string::append(&mut url,string::utf8(b".png"));
        let token_mutator_ref = token::generate_mutator_ref(&token_constructor_ref);
        token::set_uri(&token_mutator_ref, url);

        // burn url
        let token_signer = object::generate_signer(&token_constructor_ref);
        let burn_ref = token::generate_burn_ref(&token_constructor_ref);
        move_to(
            &token_signer,
            TokenRefsStore{
                burn_ref,
            }
        )
    }

    public entry fun burn(create:&signer, object:Object<Token>) acquires TokenRefsStore {
        let TokenRefsStore{
            burn_ref
        } = move_from<TokenRefsStore>(object::object_address(&object));

        token::burn(burn_ref);
    }
}
