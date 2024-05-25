module MyNFT::first_nft{
    use std::acl::add;
    use std::option;
    use std::signer;
    use std::signer::address_of;
    use std::string;
    use aptos_std::math64::max;
    use aptos_framework::object;
    use aptos_framework::object::Object;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use aptos_token_objects::token::{royalty, Token, creator};

    // collection information
    const CollectionDescription:vector<u8> = b"collection_description";
    const CollectionName:vector<u8> = b"collection_name";
    const CollectionURI:vector<u8> = b"collection_uri";
    // token information
    const TokenDescription:vector<u8> = b"token_description";
    const TokenName:vector<u8> = b"token_name";
    const TokenURI:vector<u8> = b"token_uri";

    // create collection
    public entry fun create_collection(creator:&signer){
        let max_supply = 1000;
        let collection_construcor_ref = collection::create_fixed_collection(
            creator,
            string::utf8(CollectionDescription),
            max_supply,
            string::utf8(CollectionName),
            option::some(royalty::create(1,1,address_of(creator))),
            string::utf8(CollectionURI),
        );
    }

    struct TokenRefsStore has key{
        burn_ref:token::BurnRef,
    }
    public entry fun mint (creator:&signer){
        let token_construcor_ref = token::create(
            creator,
            string::utf8(CollectionName),
            string::utf8(TokenDescription),
            string::utf8(TokenName),
            option::some(royalty::create(1,1,address_of(creator))),
            string::utf8(TokenURI)
        );

        let token_signer = object::generate_signer(&token_construcor_ref);

        let burn_ref= token::generate_burn_ref(&token_construcor_ref);
        move_to(
            &token_signer,
            TokenRefsStore{
            burn_ref
        })
    }
    public entry fun burn (creator:&signer,object:Object<Token>) acquires TokenRefsStore {
        let TokenRefsStore{burn_ref} = move_from<TokenRefsStore>(object::object_address(&object));
        token::burn(burn_ref);
    }
}