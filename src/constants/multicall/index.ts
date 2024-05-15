import { ChainId } from '@nnmax/uniswap-sdk-v2'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.BLAST]: process.env.REACT_APP_BLAST_MULTICALL_NETWORKS!,
  [ChainId.BLAST_TESTNET]: process.env.REACT_APP_BLAST_TESTNET_MULTICALL_NETWORKS!,
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
