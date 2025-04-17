import axios, { AxiosError } from 'axios';

const api_id = process.env.SHAP_API_ID;
const api_secret = process.env.SHAP_API_SECRET;
const domain = process.env.DOMAIN_SHAP;


const apiShap = axios.create({
    baseURL: domain,
});


// Format de l'objet pour la création de la facture
interface Payout {
    amount: number;
    payee_msisdn: string;
    external_reference: string;
    payout_type : string
}

interface PayoutData {
    payment_system_name  : string,
    payout : Payout,
    token : any
}


export const generateToken = async () => {
    try {
        const response = await apiShap.post('/merchant/auth', { api_id, api_secret });
        return response.data;
    } catch (error) {
        console.error('Erreur inattendue : ', error);
        throw error;
    }
};

export async function CreatePayout(data: PayoutData) {
    try {
        if(data.token.access_token){
            const response = await apiShap.post('/merchant/payout', data, {
                headers: {
                    Authorization: `Bearer ${data.token.access_token}`,
                },
            })
            //console.log(response.data)
            return response.data
        }
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Erreur lors de la création du paiement :', error.response?.data);
            return error.response?.data
        } else {
            console.error('Erreur inattendue :', error);
            return error
        }
    }
}
