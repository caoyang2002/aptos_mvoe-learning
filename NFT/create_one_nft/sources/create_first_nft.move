module MyNFT::first_NFT{
    // https://github.com/caoyang2002/Aptos-Docs/blob/main/AIP/aip-22.md
    use std::option;
    use std::signer;
    use std::string;
    use aptos_std::type_info::account_address;
    use aptos_framework::object;
    use aptos_framework::object::Object;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;
    use aptos_token_objects::token;
    use aptos_token_objects::token::Token;

    // collection
    const CollectionDescription:vector<u8> = b"collection_description";
    const CollectionName:vector<u8> = b"collection_name";
    const CollectionURI:vector<u8> = b"collection_uri";
    // token info
    const TokenDescription:vector<u8> = b"token_description";
    const TokenName:vector<u8> = b"token_name";
    const TokenURI:vector<u8> = b"token_uri";
    // token ref manager
    struct TokenRefsStore has key {
        burn_ref: token::BurnRef,
    }

    // step one: create a collection
    public entry fun create_collection(creator: &signer) {
        let max_supply = 1000;
        let collection_construcor_ref = &collection::create_fixed_collection(
            creator,
            string::utf8(CollectionDescription),
            max_supply,
            string::utf8(CollectionName),
            option::some(royalty::create(1,1,signer::address_of(creator))),
            string::utf8(CollectionURI)
        );
    }

    // step two: mint NFT
    public entry fun mint(creator: &signer){
        let token_constructor_ref = &token::create(
            creator,
            string::utf8(CollectionName),
            string::utf8(TokenDescription),
            string::utf8(TokenName),
            option::some(royalty::create(1,1,signer::address_of(creator))),
            string::utf8(TokenURI)
            );
        // Create a reference for burning an NFT
        let burn_ref = token::generate_burn_ref(token_constructor_ref);
        move_to(
            creator,
            TokenRefsStore{
                burn_ref,
            }
        );
    }

    // step three: burn NFT
    public entry fun burn(creator:&signer) acquires TokenRefsStore {
        // let token_address  = object::object_address(&token);
        let TokenRefsStore{
            burn_ref,
        } = move_from<TokenRefsStore>(signer::address_of(creator));
        token::burn(burn_ref)
    }
}
