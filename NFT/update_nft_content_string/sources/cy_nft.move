module cccy::ccyh_nft{
    use std::option;
    use std::option::none;
    use std::signer;
    use std::string;
    use aptos_std::string_utils;
    use aptos_framework::account;
    use aptos_framework::account::SignerCapability;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_framework::object::Object;
    use aptos_framework::resource_account;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use aptos_token_objects::token::Token;


    const ResourceAccountSeed:vector<u8> = b"cccy"; // seed
    const CollectionURI:vector<u8> = b"https://www.caoyang2002.top/usr/uploads/2023/08/4079902677.jpg"; // image NFT URL (mini)
    const CollectionDescription:vector<u8> = b"a NFT image";
    const CollectionName:vector<u8> = b"bird bulu";
    const TokenURL:vector<u8> = b"https://www.caoyang2002.top/usr/uploads/2023/08/4079902677";
    const TokenPrefix:vector<u8> = b"";
    const ERROR_NOWNER:u64 = 1;

    struct ResourceCap has key{ //not capability
        cap:SignerCapability
    }
    struct CollectionRefStore has key{ // store collection
        mutator_ref: collection::MutatorRef,
    }
    struct TokenRefStore has key{
        mutator_ref: token::MutatorRef,
        burn_ref: token::BurnRef,
        extend_ref: object::ExtendRef,
        transfer_ref:option::Option<object::TransferRef>
    }
    struct Content has key{
        content: string::String
    }

    #[event]
    struct MintEvent has drop,store {
        owner: address,
        token_id: address,
        content: string::String
    }

    #[event]
    struct BurnEvent has drop,store{
        owner:address,
        token_id: address,
        content: string::String
    }


    // init
    fun init_module(sender: &signer){
        // create a empty resource account, get signer and cap
        let (resource_signer,resource_cap) = account::create_resource_account(sender,ResourceAccountSeed);
        // move resource to current signer
        move_to(&resource_signer,ResourceCap{cap:resource_cap});
        //create collection return ref
        let collection_ref = collection::create_unlimited_collection(
            &resource_signer,
            string::utf8(CollectionDescription),
            string::utf8(CollectionName),
            option::none(), // fee
            string::utf8(CollectionURI));
        // generate collection signer
        let collection_signer = object::generate_signer(&collection_ref);
        // generate collection mutator ref
        let collection_mut_ref = collection::generate_mutator_ref(&collection_ref);
        // move collection to current signer
        move_to(&collection_signer,CollectionRefStore{mutator_ref:collection_mut_ref});

    }

    // mint
    entry public fun mint(sender: &signer,content: string::String) acquires ResourceCap {
        // borrow
        // not add '&' witbout the copy ability
        let resource_cap = &borrow_global<ResourceCap>(account::create_resource_address(&@cccy,ResourceAccountSeed)).cap;
        // create a rexource signer
        let resource_signer = &account::create_signer_with_capability(resource_cap);
        // u8 to utf8
        let url = string::utf8(TokenURL);
        // create token ref
        let token_ref = token::create_numbered_token(
            resource_signer,
            string::utf8(CollectionName),
            string::utf8(CollectionDescription),
            string::utf8(TokenPrefix),
            string::utf8(b""),
            option::none(),
            string::utf8(b"")
        );
        // get id from object constuctor
        // let id = token::index<Token>(object::object_from_constructor_ref(&token_ref));
        //
        // mutable reference url, Add integers to url after converting them to characters
        // string::append(&mut url,string_utils::to_string(&id));

        //

        // add characters to url
        string::append(&mut url, string::utf8(b".jpg"));
        // gennerate token signer
        let token_signer = object::generate_signer(&token_ref);
        // mutable reference of token
        let token_mut_ref = token::generate_mutator_ref(&token_ref);
        //set utl of token
        token::set_uri(&token_mut_ref,url);
        // gemnerate burnout ref
        let token_burn_ref = token::generate_burn_ref(&token_ref);
        // move token resource ref to token signer
        move_to(
            &token_signer,
            TokenRefStore{
                mutator_ref:token_mut_ref,
                burn_ref:token_burn_ref,
                extend_ref: object::generate_extend_ref(&token_ref),
                transfer_ref:option::none()
            }
        );
        // move content string to token signer
        move_to(&token_signer,Content{content});
        // trigger event
        event::emit(
            MintEvent{
                owner: signer::address_of(sender),
                token_id: object::address_from_constructor_ref(&token_ref),
                content
            }
        );
        // trade ,
        object::transfer(
            resource_signer,
            object::object_from_constructor_ref<Token>(&token_ref),
            signer::address_of(sender)
        )
    }



    entry fun burn(
        sender:&signer,
        object: Object<Content>
    )acquires TokenRefStore,Content {
        // Obtain whether the user uses ownership
        assert!(object::is_owner(object,signer::address_of(sender)),ERROR_NOWNER);
        // get burn ref
        let TokenRefStore{
            mutator_ref : _,
            burn_ref,
            extend_ref:_,
            transfer_ref:_,
        } = move_from<TokenRefStore>(object::object_address(&object));
        // Take out an TokenRefStore type from the object

        // get content
        let Content{
            content
        } = move_from<Content>(object::object_address(&object));
        event::emit(BurnEvent{
            owner:object::owner(object),
            token_id: object::object_address(&object),
            content
        });
        // burn
        token::burn(burn_ref)
    }

    // get net content
    #[view]
    public fun get_content(object:Object<Content>):string::String acquires Content{
        borrow_global<Content>(object::object_address(&object)).content
    }


    #[test(sender = @cccy)]
    public fun main(sender:&signer){
        // init_module(sender)
    }
}
