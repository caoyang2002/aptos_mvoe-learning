module MyNFT::first_NFT{
    // https://github.com/caoyang2002/Aptos-Docs/blob/main/AIP/aip-22.md
    use std::option;
    use std::signer;
    use std::string;
    use aptos_token_objects::collection;
    use aptos_token_objects::royalty;

    const CollectionDescription:vector<u8> = b"collection_description";
    const CollectionName:vector<u8> = b"collection_name";
    const CollectionURI:vector<u8> = b"collection_uri";

    // step one: create a collection
    public entry fun create_collection(creator: &signer) {
        let max_supply = 1000;
        collection::create_fixed_collection(
            creator,
            string::utf8(CollectionDescription),
            max_supply,
            string::utf8(CollectionName),
            option::some(royalty::create(1,1,signer::address_of(creator))),
            string::utf8(CollectionURI)
        );
    }
}
