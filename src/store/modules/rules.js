export default {
   state: {
      special_chars: "`~!@#$%^&*()=+/?<>.,[]{}\"\\",
      reserved_words: [
         'all',
         'home',
         'default',
         'temp',
         'temporary',
         'delete',
         'add',
         'null',
         'undefined',
         'select',
         'script',
         'collaboration',
         'in',
         'update',
         'from',
         'select',
         'update',
         'insert',
         'modify',
         'create',
         'alter',
      ],
   },
   getters: {
      input_rules(state) {
         const required = (value) => {
            if (!value?.trim?.()) return 'Required';
            return true;
         }
         const special = (value) => {
            if (!value) return true;
            const chars = state.special_chars;
            if (!chars) return true;
            let i, exists = false;
            for (i = 0; i < value.length; i++) {
               if (chars.includes(value[i])) {
                  exists = value[i];
                  break;
               }
            }
            if (exists) return `Special character: ${exists}`;
            return true;
         }

         const reserved = (value) => {
            if (!value) return true;
            const reserved = state.reserved_words;
            const word = value.trim().toLowerCase();
            if (reserved.includes(word)) return `${word} is a reserved word`;
            return true;
         }

         const number = (value) => {
            if (!value) return true;
            return !isNaN(+value);
         }

         const minimum = (value) => {
            if (value && value.length < 3) return 'Requires at least 3 characters';
            return true;
         }

         const unspaced = (value) => {
            if (!value) return true;
            if (typeof value !== 'string') return true;
            if (value && value.includes(' ')) return 'Space is not allowed';
            return true;
         }

         const secode = (value) => {
            if (!value) return true;
            const number = +value;
            if (Number.isNaN(number)) return 'Must be number';
            const split = value.split('');
            if (split.length !== 4) return 'Must be 4 digits';
            return true;
         }

         const uppercase = (value) => {
            if (!value || typeof value !== 'string') return true;
            const current = value.trim();
            const upper = value.toUpperCase().trim();
            if (current !== upper) return "Must be uppercase";
            return true;
         }

         const string = (value) => {
            if (!value) return true;
            if (!Number.isNaN(+value)) return "Cannot be number";
            return true;
         }

         return ({ required, special, reserved, number, minimum, unspaced, secode, uppercase, string });
      }
   },
}