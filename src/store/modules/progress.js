export default {
   state: {
      progress: {
         show: false,
         msg: '',
      }
   },

   mutations: {
      PROGRESS(state, payload) {
         state.progress = {
            ...state.progress,
            ...payload,
         }
      },
   },

   actions: {
      async progress({ commit }, payload) {
         if (!payload) {
            commit('PROGRESS', { show: false, msg: '' });
            return { status: true }
         }

         if ('msg' in payload) {
            commit('PROGRESS', {
               show: true,
               msg: payload.msg,
            });
         }

         if (payload.close_in) {
            // const closeIn = payload.close_in;
            // const timeout = (Number.isNaN(+closeIn)) ? 1000 : +closeIn;

            // setTimeout(() => commit('PROGRESS', { show: false, msg: '' }), timeout);
            commit('PROGRESS', { show: false, msg: '' })

            return { status: true }
         }

         if ('show' in payload) {
            commit('PROGRESS', { ...payload, show: !!payload.show, });
            return { status: true };
         }

         commit('PROGRESS', payload);
         return { status: true };
      },
   },
};