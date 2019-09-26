export const zeroToFive = {
    [Symbol.iterator]() {
        return {
            current: 0,
            last: 5,
            next() {
                const ret = this.current < this.last
                    ? { done: false, value: this.current++ }
                    : { done: true };
                
                // assert later
                global.foo = this.current;

                return ret;
            }
        };
    }
};
