module 0x43::hornor{
    use std::string;
    use std::vector;
    use aptos_std::debug;
    use aptos_std::smart_table;
    use aptos_std::string_utils;

    fun print_str1_num1(str:string::String,num:u64){
        string::append(&mut str, string_utils::to_string(&num));
        debug::print(&str);
    }

    fun print_str2_num2(str_1:string::String,num_1:u64,str_2:string::String,num_2:u64){
        string::append(&mut str_1, string_utils::to_string(&num_1));
        string::append(&mut str_1,str_2);
        string::append(&mut str_1,string_utils::to_string(&num_2));
        debug::print(&str_1);
    }

    fun sum_of_two(vec:vector<u64>,target:u64):(u64,u64) {
        let hash_map = smart_table::new<u64, u64>();
        let index_1 = 0;
        let vec_len = vector::length(&vec);
        print_str1_num1(string::utf8(b"vec_len = "),vec_len);
        while (index_1 <= vec_len - 1) {
            let element = vector::borrow(&vec, index_1);

            print_str2_num2(string::utf8(b"vec_element = "),*element,string::utf8(b", index_1 = "),index_1);
            if ( *element > target){
                index_1 = index_1 + 1;
                debug::print(&string::utf8(b"continue"));
                continue
            };

            let difference = target - *element;
            print_str1_num1(string::utf8(b"defference = "),difference);

            let contain = smart_table::contains(&hash_map,difference); // query key
            debug::print(&contain);

            if (smart_table::contains(&hash_map,difference)){
                let index_2:u64= *smart_table::borrow(&hash_map,difference); // return value
                print_str2_num2(string::utf8(b"index_1 = "),index_1,string::utf8(b", index_2 = "),index_2);
                smart_table::destroy(hash_map);
                return (index_1,index_2)
            };
            smart_table::upsert(&mut hash_map,*element,index_1); // key value
            index_1 = index_1 + 1;
        };
        smart_table::destroy(hash_map);
        return (0,0)
    }

    #[test]
    fun test(){
        let vec = vector[4,4];
        let target = 8;
        let out_vec = vector[];
        let (a,b) =  sum_of_two(vec,target);
        vector::push_back(&mut out_vec,a);
        vector::push_back(&mut out_vec,b);
        debug::print(&mut out_vec);
    }
}