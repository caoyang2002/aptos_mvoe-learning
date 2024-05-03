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
    const TokenDescription:vector<u8> = b"token_dpescription";
    const TokenName:vector<u8> = b"token_name";
    const TokenURI:vector<u8> = b"token_uri";
    // token ref manager
    struct TokenRefsStore has key {
        // mutator_ref: token::MutatorRef,
        burn_ref: token::BurnRef,
        // extend_ref: object::ExtendRef,
        // transfer_ref: option::Option<object::TransferRef>
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
        // Create a mutable reference to the collection
        // let collection_mutator_ref = collection::generate_mutator_ref(collection_construcor_ref);
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
        // Create a mutable reference to the token
        // let token_mutator_ref = token::generate_mutator_ref(token_constructor_ref);
        // Create a reference for burning an NFT
        let burn_ref = token::generate_burn_ref(token_constructor_ref);
        // move_to(
        //     creator,
        //     TokenRefsStore{
        //         burn_ref,
        //     }
        // );
    }

    // step three: burn NFT
    public entry fun burn(token:Object<Token>) acquires TokenRefsStore {
        // let token_address  = object::object_address(&token);
        let TokenRefsStore{
            // mutator_ref: _,
            burn_ref,
            // extend_ref: _,
            // transfer_ref: _
        } = move_from<TokenRefsStore>(object::object_address(&token));
        token::burn(burn_ref)
    }
}
