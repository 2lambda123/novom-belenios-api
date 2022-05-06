import settings from '../../settings';

export const ELECTIONS_DIR = (settings && settings.elections_dir) || `${__dirname}/../../../elections`;
export const GROUP_FILE_PATH = `${__dirname}/../../files/groups/default.json`;
export const ELECTION_FILE_NAME = 'election.json';
export const TRUSTEES_FILE_NAME = 'trustees.json';
export const TEMPLATE_FILE_NAME = 'template.json';
export const VOTERS_FILE_NAME = 'voters.txt';
export const PRIVATE_CREDENTIALS_FILE_NAME = 'private_creds.txt';
export const BALLOTS_FILE_NAME = 'ballots.jsons';
export const PRIV_KEYS_FILE_NAME = 'private_keys.jsons';
export const PUBLIC_CREDENTIALS_FILE_NAME = 'public_creds.txt';
export const PARTIAL_DECRYPTIONS_FILE_NAME = 'partial_decryptions.jsons';
export const RESULT_FILE_NAME = 'result.json';
