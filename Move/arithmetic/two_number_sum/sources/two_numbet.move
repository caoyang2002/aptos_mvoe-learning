module two_num::sum_of_two_numebr{

    use std::string;
    use std::string::String;
    use std::vector;
    use std::vector::{ index_of, contains};
    use aptos_std::debug;
    use aptos_std::string_utils;
    #[test_only]
    use std::vector::push_back;


    fun format_print(str_1:String,num_1:u64,str_2:String,num_2:u64){
        string::append(&mut str_1, string_utils::to_string(&num_1));
        string::append(&mut str_1,str_2);
        string::append(&mut str_1,string_utils::to_string(&num_2));
        debug::print(&str_1);
    }
    // fun index_exist_eq(vec:vector<u64>,num:u64):bool{
    //     let (bool,_) = index_of(&vec,&num);
    //     bool
    // }


    //NOTE
    // vec[i] be not allowed
    // let j = target - vec[i];

    fun sum_of_two(vec:vector<u64>,target:u64):(u64,u64) {
        let index_1 = 0;
        let n = vector::length(&vec);
        debug::print(&n);
        while (index_1 <= n-1) {
            let x = vector::borrow(&vec, index_1);

            // current vec content
            let str_1 = string::utf8(b"index_1 = ");
            let str_2 = string::utf8(b", vector_element = ");
            format_print(str_1,index_1,str_2,*x);

            // continue
            // Subtraction operation will yield a result less than zero,
            // which is not allowed in Move, as Move's integer types are all unsigned.
            // ---> let j = target - *x;

            if ( *x > target){
                index_1 = index_1 + 1;
                continue
            };

            let j = target - *x;
            //
            let (is_exit,index_2) = index_of(&vec,&j); // return index
            debug::print(&is_exit);
            debug::print(&index_2);
            let is_contains = contains(&vec,&j); // return bool
            debug::print(&is_contains);
            if (is_contains && is_exit && index_2 != index_1) {
                return (index_1, index_2)
            };
            index_1 = index_1 + 1;
        };
        return (0, 0)
    }

    #[test]
    fun test(){
        let vec = vector[1,3,7,5,9,4,0,22,6,32,8];
        let target = 30;
        let out_vec = vector[];
        let (a,b) =  sum_of_two(vec,target);
        push_back(&mut out_vec,a);
        push_back(&mut out_vec,b);
        debug::print(&mut out_vec);
        // [debug] [ 7, 10 ]
    }
}