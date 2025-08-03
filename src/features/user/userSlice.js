import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { showToastMessage } from '../common/uiSlice';
import api from '../../utils/api';
import { initialCart } from '../cart/cartSlice';

export const loginWithEmail = createAsyncThunk(
    'user/loginWithEmail',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/login', { email, password });

            sessionStorage.setItem('token', res.data.token);
            return res.data;
        } catch (err) {
            console.log(err);
            return rejectWithValue(err.message);
        }
    }
);

export const loginWithGoogle = createAsyncThunk('user/loginWithGoogle', async (token, { rejectWithValue }) => {});

export const logout = () => (dispatch) => {
    sessionStorage.removeItem('token');
    dispatch(logoutSuccess());
    dispatch(
        showToastMessage({
            message: '로그아웃 되었습니다.',
            status: 'success',
        })
    );
};

export const registerUser = createAsyncThunk(
    'user/registerUser',
    async ({ email, name, password, navigate }, { dispatch, rejectWithValue }) => {
        try {
            const res = await api.post('/user', { email, name, password });
            dispatch(
                showToastMessage({
                    message: '회원가입을 성공했습니다.',
                    status: 'success',
                })
            );
            navigate('/login');
            return res.data.data;
        } catch (err) {
            dispatch(
                showToastMessage({
                    message: '회원가입을 실패했습니다.',
                    status: 'error',
                })
            );
            rejectWithValue(err.error);
        }
    }
);

export const loginWithToken = createAsyncThunk('user/loginWithToken', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/user/me');
        return res.data;
    } catch (err) {
        return rejectWithValue(err.error);
    }
});

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        loading: false,
        loginError: null,
        registrationError: null,
        success: false,
    },
    reducers: {
        clearErrors: (state) => {
            state.loginError = null;
            state.registrationError = null;
        },
        logoutSuccess: (state) => {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
                state.registrationError = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.registrationError = action.payload;
            })
            //loginWithEmail
            .addCase(loginWithEmail.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginWithEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.loginError = '';
            })
            .addCase(loginWithEmail.rejected, (state, action) => {
                state.loginError = action.payload;
            })
            //loginWithToken
            .addCase(loginWithToken.fulfilled, (state, action) => {
                state.user = action.payload.user;
            });
    },
});
export const { clearErrors, logoutSuccess } = userSlice.actions;
export default userSlice.reducer;
