import { db } from "./db";
import { users, healers } from "../shared/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "./auth";

// All users from production CSV export - passwords are preserved as-is so existing logins continue working.
// The shared healer password hash corresponds to "Aurfy@123" (the default healer password).
const SHARED_HEALER_HASH = "e0a17273d9f4272ef27f08bb904c5a96e4f2d44cd6c4c0ca1f10823f9fd0bfd00041a67eee030b7dd0eb2faba31179dbf7c9f7cd4f43796a4d7909f2b93ac1c8.59e298729a4dd8685ae80b80cc48f4cf";

const CSV_USERS: Array<{
  username: string;
  password: string;
  userType: "client" | "healer" | "semi-healer";
  birthDate?: string;
  email?: string;
  mobileNumber?: string;
  credits: number;
  soulEnergy: number;
}> = [
  { username: "vidhugupta1996@gmail.com", password: "8f1194b71e5044450d5fc1add78d8707ae4c5e5655b209db05c485b5a795ca4236ec179d1a8455a1f338a3ce4c2f5127f862b5ba8a6409aa1e3667292fbb220d.9719e97e7d0a10099d630118dac5f097", userType: "client", birthDate: "1996-08-23", credits: 0, soulEnergy: 0 },
  { username: "vidhu", password: "75724e0c047053b937f8952966db9afe8c5ed8c2a184414c55bcd7810a4d5b4a8921664a7b1733cc2a9641e121d384bc9c4a145335b08197f4abd7eacf63412f.9208a64172f6c71714e10f65f6d27801", userType: "client", birthDate: "1992-11-12", credits: 31, soulEnergy: 0 },
  { username: "test@example.com", password: "155c759f8a08678273b508bdedbae8bfbcb8a51975bb8ad87b46410cae402eeaf3e5cb032cafdc36fdb6acd9eae79a94984cbb6e937737491dc1ec95845a6b7a.f065071186b9959ba122096c53b86438", userType: "healer", credits: 100, soulEnergy: 0 },
  { username: "teamnishant", password: "b6932cb32bcf6dc2127943663471cdc30863d30144485168e4a570efc941a1d6df8cef142a34a945f3f1391e61661df685f87c5c4126bf85bc3420ff85896a65.204c98d96a232a68c73cbb56c4989bf4", userType: "healer", birthDate: "1987-01-31", credits: 462, soulEnergy: 0 },
  { username: "vidhugupta@gmail.com", password: "c36ebf03d2c5e77e4ff900f19d9f733a6940737d18ddcce336ede6c00eced46e3376a5184dabef095d4dec11bf030ac44cf05248a890318b337c1734496c44c9.d14bc8573b10eed6f76c641fc8f04ec6", userType: "client", birthDate: "1996-08-23", credits: 25, soulEnergy: 0 },
  { username: "vidhu g", password: "c0aa5e0dcb70406c08b56fe54f9255efa1d6f7a2b79f09e6c7cb569136cf1775ac84a335497bf5346009d437b733168f3d83221f6a0109ca3a8e6a845849c787.48cb110dc4927b0dff15b4f77a85c079", userType: "client", birthDate: "1996-08-23", credits: 50, soulEnergy: 0 },
  { username: "rupagupta", password: "ffeedbe988cc54ae6f57eda0bd34306e28eea9400f80f788c738be25cba1f40f6b9ca3a52dba94662191ab0b795aa8c62f8699caa954d03c988c0639feaae946.a80bf4ec15f3538d24d3282957acc709", userType: "client", birthDate: "1976-02-11", credits: 50, soulEnergy: 0 },
  { username: "admin", password: "d9ee8b1597da29124334a88cbc5d75b389086cfbcc093f0761fcbebfd656c9ead1c505ccc3532c61671f4c759529a3aa4c4f9a457faf9ab8bd4065a6c6c40d5d.dfe4e101df0a6191da490c49f00f03b1", userType: "client", birthDate: "1987-01-31", credits: 50, soulEnergy: 0 },
  { username: "Healer nishant academy", password: "115ffcbc33d112b5a3feeb99b04a187f73a58e27dd7694d0e97dd23a6f3ed9f7ac0d973eb16a166a896cea61bfa5518d3791703c889be202fdc7dd93005df220.b125e12a43e5632e7c2ad7a94f1db95d", userType: "healer", birthDate: "2025-07-10", email: "nishant@academy.com", mobileNumber: "+1234567890", credits: 100, soulEnergy: 0 },
  { username: "Nishant.sharma", password: "fb6d07b316e49c3724ec08cd5f2638b8bfe754b7b65c992a8df32052a7b7e70ca5a5eb24631da16bf3b3065903adca10808b504636785b3c12689c6f9c117117.b78931cceeadee5bad93fe092c3606e7", userType: "client", birthDate: "2025-07-17", credits: 50, soulEnergy: 0 },
  { username: "NishantSharma", password: "879ec91a3bb58595e05b40d2092a4b8499b7408467d3a8f429c302465f33b37a578ce60cac01aabf4fd5de42c196085d8c178b36a96f807146edbdeca5096834.32aabf286285771d0200458d2b4c0dba", userType: "client", birthDate: "1987-01-31", credits: 50, soulEnergy: 0 },
  { username: "nishant.sharma2", password: "fe40a1ccf54091eea889d3535a33bc1f4d2ab20dd6f71a91f0ea8dbc1a6de70e9b3d7f4c54a684d6bbedf0b4d4ade21bcdd9b5fcaf96d63740b618e4a6c68189.477f6c278c60b279d2cc6dd2360218cc", userType: "healer", credits: 1649, soulEnergy: 0 },
  { username: "rupa.gupta", password: "cd8db88fee6224a0284ace868c4bcd02e6b4cad282e52c6081b997824b1405a212a58a405e453cd110038f608f4616435b4ba28a22341b560ab1390e2014583a.32b72c9cca08d5ba8257760bc639147d", userType: "healer", credits: 262, soulEnergy: 0 },
  { username: "vidhu.gupta", password: "6ea858c0c290419756f9f9f2e362d0a4b6ce7f040707a67ae56fe55c41fa773d9ffe331fb810028d0ed466040e56f7bc15c4d03a3dba0e7814ddd0b01bc41f20.c1842e8c3a057409888bdffd8a05a4eb", userType: "healer", credits: 59, soulEnergy: 6 },
  { username: "Shweta.Singh", password: SHARED_HEALER_HASH, userType: "healer", email: "shweta402@gmail.com", mobileNumber: "+91 6143889948", credits: 129, soulEnergy: 0 },
  { username: "Reema.Chopra", password: SHARED_HEALER_HASH, userType: "healer", email: "My360wellness1@gmail.com", mobileNumber: "+91 2575539203", credits: 125, soulEnergy: 0 },
  { username: "Varsha.Gangrade", password: SHARED_HEALER_HASH, userType: "healer", email: "varshagangrade@aurfy.com", mobileNumber: "+91 7673167341", credits: 150, soulEnergy: 0 },
  { username: "DrShradha.Sharma", password: SHARED_HEALER_HASH, userType: "healer", email: "shradhasharma@aurfy.com", mobileNumber: "+91 9297679876", credits: 100, soulEnergy: 0 },
  { username: "Paridhi.Rustagi", password: SHARED_HEALER_HASH, userType: "healer", email: "paridhirustagi@aurfy.com", mobileNumber: "+91 8757066157", credits: 126, soulEnergy: 0 },
  { username: "Deepa_Rathore", password: SHARED_HEALER_HASH, userType: "healer", email: "deeparathore@aurfy.com", mobileNumber: "+91 8639077887", credits: 150, soulEnergy: 0 },
  { username: "Jahnavi.sarma", password: SHARED_HEALER_HASH, userType: "healer", email: "jahnavi.aurareader@gmail.com", mobileNumber: "+91 2414783710", credits: 150, soulEnergy: 0 },
  { username: "Kiran.Ajay", password: SHARED_HEALER_HASH, userType: "healer", email: "kiran26january@gmail.com", mobileNumber: "+91 6069307791", credits: 141, soulEnergy: 0 },
  { username: "Manikyamba.Talari", password: SHARED_HEALER_HASH, userType: "healer", email: "manikyambatalari@aurfy.com", mobileNumber: "+91 7973894227", credits: 132, soulEnergy: 0 },
  { username: "Rameeta.A", password: SHARED_HEALER_HASH, userType: "healer", email: "rameetaa@aurfy.com", mobileNumber: "+91 1048728008", credits: 135, soulEnergy: 0 },
  { username: "Annapoorna.kumaar", password: SHARED_HEALER_HASH, userType: "healer", email: "annapoorna@pawnection.com", mobileNumber: "+91 6550309910", credits: 131, soulEnergy: 0 },
  { username: "Rameeeta.a", password: SHARED_HEALER_HASH, userType: "healer", email: "rameeetaa@aurfy.com", mobileNumber: "+91 2295150135", credits: 150, soulEnergy: 0 },
  { username: "Shaina.Mohite", password: SHARED_HEALER_HASH, userType: "healer", email: "shainamohite@aurfy.com", mobileNumber: "+91 3843748026", credits: 137, soulEnergy: 0 },
  { username: "Pooja.Taneja", password: "bcc9167afda8b5288a21701dc863afdf5fdc7c49aee89092a812f2afc484390cff5bbd620acb4f9b1e6f8dea2945a032fcfe4a6c44ef3a6fcf7a05d5dd65daed.cbd505526d5503b5775237d983e24fdb", userType: "healer", email: "poojataneja@aurfy.com", mobileNumber: "+91 9674095373", credits: 148, soulEnergy: 0 },
  { username: "Shradha.sharma", password: SHARED_HEALER_HASH, userType: "healer", email: "shradhasharma@aurfy.com", mobileNumber: "+91 8496053177", credits: 150, soulEnergy: 0 },
  { username: "Avanthi.maniyala", password: SHARED_HEALER_HASH, userType: "healer", email: "avanthimaniyala@aurfy.com", mobileNumber: "+91 9857185359", credits: 142, soulEnergy: 0 },
  { username: "Ashwini.Badgandi", password: SHARED_HEALER_HASH, userType: "healer", email: "GlowCSoulAura33@gmail.com", mobileNumber: "+91 4372908026", credits: 148, soulEnergy: 0 },
  { username: "Deepika", password: SHARED_HEALER_HASH, userType: "healer", email: "deepika@aurfy.com", mobileNumber: "+91 6088948571", credits: 138, soulEnergy: 0 },
  { username: "Manolinie", password: SHARED_HEALER_HASH, userType: "healer", email: "seihanasoulwork@gmail.com", mobileNumber: "+91 7246578572", credits: 139, soulEnergy: 0 },
  { username: "Avisha.kabra", password: SHARED_HEALER_HASH, userType: "healer", email: "avishakabra@aurfy.com", mobileNumber: "+91 4324556006", credits: 150, soulEnergy: 0 },
  { username: "Pratibha.Pandya", password: SHARED_HEALER_HASH, userType: "healer", email: "Pratibha.aurareader@gmail.com", mobileNumber: "+91 4485408008", credits: 127, soulEnergy: 0 },
  { username: "Arti.Shah", password: SHARED_HEALER_HASH, userType: "healer", email: "artishah@aurfy.com", mobileNumber: "+91 6983420686", credits: 148, soulEnergy: 0 },
  { username: "Roopa.Singh", password: SHARED_HEALER_HASH, userType: "healer", email: "roopasingh@aurfy.com", mobileNumber: "+91 4235943173", credits: 131, soulEnergy: 0 },
  { username: "Anju.Choudhary", password: SHARED_HEALER_HASH, userType: "healer", email: "anjuchoudhary@aurfy.com", mobileNumber: "+91 5462757724", credits: 116, soulEnergy: 0 },
  { username: "Suvarna", password: SHARED_HEALER_HASH, userType: "healer", email: "suvarna@aurfy.com", mobileNumber: "+91 3137311579", credits: 122, soulEnergy: 0 },
  { username: "Bhvna Ammbre", password: SHARED_HEALER_HASH, userType: "healer", email: "bhvnaammbre@aurfy.com", mobileNumber: "+91 8436271020", credits: 145, soulEnergy: 0 },
  { username: "Meeta.Singh", password: SHARED_HEALER_HASH, userType: "healer", email: "radiantsoul.meeta @gmail.com", mobileNumber: "+91 5026788111", credits: 111, soulEnergy: 0 },
  { username: "Vishwajeet.RKamal", password: SHARED_HEALER_HASH, userType: "healer", email: "vishwajeetrkamal@aurfy.com", mobileNumber: "+91 3947314614", credits: 150, soulEnergy: 0 },
  { username: "Jaspaul.kalsi9", password: SHARED_HEALER_HASH, userType: "healer", email: "Healerjaspaul.kalsi6@gmail.com", mobileNumber: "+91 6245768665", credits: 128, soulEnergy: 0 },
  { username: "Swetta.Mandal", password: SHARED_HEALER_HASH, userType: "healer", email: "swettamandal@aurfy.com", mobileNumber: "+91 3828377907", credits: 103, soulEnergy: 0 },
  { username: "Sujithra.ananth", password: SHARED_HEALER_HASH, userType: "healer", email: "sujithraananth@aurfy.com", mobileNumber: "+91 8279817073", credits: 114, soulEnergy: 0 },
  { username: "Ankita_Gupta", password: SHARED_HEALER_HASH, userType: "healer", email: "ankitagupta@aurfy.com", mobileNumber: "+91 4738972921", credits: 142, soulEnergy: 0 },
  { username: "Subramanyam.v", password: SHARED_HEALER_HASH, userType: "healer", email: "subramanyam.aurahealer@gmail.com", mobileNumber: "+91 4532147556", credits: 139, soulEnergy: 0 },
  { username: "Lacsshmi.Raama", password: SHARED_HEALER_HASH, userType: "healer", email: "lacsshmiraama@aurfy.com", mobileNumber: "+91 7924575675", credits: 139, soulEnergy: 0 },
  { username: "Venugopal", password: SHARED_HEALER_HASH, userType: "healer", email: "venugopal@aurfy.com", mobileNumber: "+91 2946557847", credits: 143, soulEnergy: 0 },
  { username: "Nikhil.Vashi", password: "d999e770c822d02e5576ea5c12bdb6f1d110e4d570bc3bfd858dc05012a218ce1e8f60661e791b836e107755e5961a43a7e5dfe10d224c77f1d8ec77675fce25.3aabe7eb9a91574e11a15d6a64db133f", userType: "healer", email: "NikhilSVashi.SoulCoach@gmail.com", mobileNumber: "+91 8132538008", credits: 129, soulEnergy: 0 },
  { username: "Anjaly.Kotiyan", password: SHARED_HEALER_HASH, userType: "healer", email: "anjalykotiyan@aurfy.com", mobileNumber: "+91 4782330652", credits: 150, soulEnergy: 0 },
  { username: "SonalMGarg", password: SHARED_HEALER_HASH, userType: "healer", email: "gargsonal16779@gmail.com", mobileNumber: "+91 1873672181", credits: 108, soulEnergy: 0 },
  { username: "Abhishek.Patel", password: SHARED_HEALER_HASH, userType: "healer", email: " healerabhishhek@gmail.com", mobileNumber: "+91 1586791836", credits: 138, soulEnergy: 0 },
  { username: "RAVijaya", password: SHARED_HEALER_HASH, userType: "healer", email: "ravijayakrishnaaura@gmail.com", mobileNumber: "+91 9404500556", credits: 150, soulEnergy: 0 },
  { username: "Zarina.Aziz", password: SHARED_HEALER_HASH, userType: "healer", email: "zarinaaziz@aurfy.com", mobileNumber: "+91 6579131841", credits: 145, soulEnergy: 0 },
  { username: "Madhvi_suba", password: SHARED_HEALER_HASH, userType: "healer", email: "madhvisuba@aurfy.com", mobileNumber: "+91 4487621833", credits: 150, soulEnergy: 0 },
  { username: "Khushboo.rathi", password: SHARED_HEALER_HASH, userType: "healer", email: "khushboo.aurareader@gmail.com", mobileNumber: "+91 7251885479", credits: 145, soulEnergy: 0 },
  { username: "Bhavya.Singhal.Tiwari", password: SHARED_HEALER_HASH, userType: "healer", email: "bhavyasinghaltiwari@aurfy.com", mobileNumber: "+91 4632955120", credits: 139, soulEnergy: 0 },
  { username: "Bhawnaa.Sharma", password: SHARED_HEALER_HASH, userType: "healer", email: "bhawnaasharma@aurfy.com", mobileNumber: "+91 1254356734", credits: 138, soulEnergy: 0 },
  { username: "DrVaishaliRathi", password: SHARED_HEALER_HASH, userType: "healer", email: "vaishalirathi@aurfy.com", mobileNumber: "+91 9619667074", credits: 145, soulEnergy: 0 },
  { username: "Rutima Gopala", password: SHARED_HEALER_HASH, userType: "healer", email: "rutimagopalaaurareader123456@gmail.com", mobileNumber: "+91 3957641387", credits: 118, soulEnergy: 0 },
  { username: "Janvi.Adesara", password: SHARED_HEALER_HASH, userType: "healer", email: "janvi.mukhiya@gmail.com", mobileNumber: "+91 8385306588", credits: 150, soulEnergy: 0 },
  { username: "Indu.Nandakumar", password: SHARED_HEALER_HASH, userType: "healer", email: "indunandakumar@aurfy.com", mobileNumber: "+91 2622010930", credits: 106, soulEnergy: 0 },
  { username: "Shwweta.Sharmma", password: SHARED_HEALER_HASH, userType: "healer", email: "shwetansh666@gmail.com", mobileNumber: "+91 7132975794", credits: 135, soulEnergy: 0 },
  { username: "Prince3445", password: SHARED_HEALER_HASH, userType: "healer", email: "prince@aurfy.com", mobileNumber: "+91 4047748767", credits: 150, soulEnergy: 0 },
  { username: "Purti.Sadh", password: SHARED_HEALER_HASH, userType: "healer", email: "aurareaderpurti@gmail.com", mobileNumber: "+91 5515855345", credits: 138, soulEnergy: 0 },
  { username: "Darshana.Jani", password: SHARED_HEALER_HASH, userType: "healer", email: "dr.darshana.jani@gmail.com", mobileNumber: "+91 1157148817", credits: 130, soulEnergy: 0 },
  { username: "Meenakshii.kapoor", password: SHARED_HEALER_HASH, userType: "healer", email: "meenakshiikapoor@aurfy.com", mobileNumber: "+91 8541965160", credits: 105, soulEnergy: 0 },
  { username: "Csarti", password: SHARED_HEALER_HASH, userType: "healer", email: "csarti@aurfy.com", mobileNumber: "+91 3787363288", credits: 59, soulEnergy: 0 },
  { username: "Prashanth.Sagar", password: SHARED_HEALER_HASH, userType: "healer", email: "prashanthsagar@aurfy.com", mobileNumber: "+91 1829191567", credits: 138, soulEnergy: 0 },
  { username: "Arti.Chauhan", password: SHARED_HEALER_HASH, userType: "healer", email: "chauhan.s.arti@gmail.com", mobileNumber: "+91 9513551322", credits: 150, soulEnergy: 0 },
  { username: "Nishthaa.duseja", password: "501d30da1568858ab629119dcda09430bcd5de7a2f545ab65f4ec6245cde264a88100bd53fecd9b5f324893b638620e95331295f1741b532bcaa97c52b5de793.a3b917254d68c5d526ef9cb435284b7e", userType: "healer", email: "nishthaa.duseja@aurfy.com", credits: 70, soulEnergy: 0 },
  { username: "Sharmila.Nagwekar", password: "d03ce0edc7da230158e120e408f93f66c00c208f6bbea2434929003a5372fd05e1158759ec63ebf4f5af73cc8cd80766c713c355291d64e90b8acd5ae8a20961.ca117b0fe9cd66817d520a6b8c9122fa", userType: "healer", email: "sharmila.nagwekar@aurfy.com", credits: 132, soulEnergy: 0 },
  { username: "Ramona_Jind", password: "5b614751eaa0ab84a01e8f8371a3d3f5b8f5418e5b01d0f745a1abfadc7645a3e4abcec76dbc4b746cf2e979404f31237c9c538aa1a35fe2dae0c96d39b23c5d.2373e6c31ba0e8aaf401d8276d6c9fb3", userType: "healer", email: "ramona_jind@aurfy.com", credits: 120, soulEnergy: 0 },
  { username: "Sweta.Verma.Rawat", password: "e2635fa499ef5fb032cc10e74ee984d32bd2531d02369c1a31d7a2ce943fbabf919d1ecb408f667961e2cd3eeac403a9c937d126593a53c2f59ba2f0e06dc254.e69b6f9e51d563ca859779495f380a69", userType: "healer", email: "swetavermarawat.hr@gmail.com", credits: 125, soulEnergy: 0 },
  { username: "Karthika.Madhu", password: "02ea952a78886412b787700419f7303a00d619de77fe365ead2872f37667a4a474ec4a19b05d2c45b554d109ee0eb00df67bb4eb6bb7040eb906bb392157a3e2.7ef74d2be00ffe4d0df6811a58fd7f28", userType: "healer", email: "thekiyoraascension@gmail.com", credits: 138, soulEnergy: 0 },
  { username: "Sunita.Mann", password: "23823d68f1e0a5e1ce258f3ae1ee428b10c7d014a26b6fa1d1155ded76510d5e45c1b17321ca9aa46b66c8b2bf3ea8802700fcbc5445e78391adb83b583958ce.228c74a965ddb64950841d30f3f853f7", userType: "healer", email: "sunita.mann@auraeye.com", credits: 25, soulEnergy: 0 },
  { username: "Namrata.kukadiya", password: "c25b82887b6392bd9c8974abca204d30bc68f9c5d034303a3fe99947b9f73af230cdf957d3cfb38753ccf6c6ddcef1b45f34d68c5c65c0e27635b22c7edf7d54.faf50f4c5d2c73698783babaeb1b3b6a", userType: "healer", email: "namrata.kukadiya@auraeye.com", credits: 135, soulEnergy: 0 },
  { username: "test.user", password: "b19a8127234c354e3176e6f38a393c273135363c5916a500c7a086164d2382434647e3b6e3a850f64b12244517ee2d0f25e9dae41fb6fd043a2b27a61dcae8a1.994b8d24838021338d816c14b6046ae6", userType: "healer", credits: 99, soulEnergy: 0 },
  { username: "auraeye.solutions", password: "4bf3d3652e9b83d493f0448f88457ff1c08e27907962981aa1ba11b2e1c05adf5bcf3e12bf104993e1a7882ad72923fd8b9ce59cd84c67a4965e69c7204f111d.4965183659bf68376e6cf9e5468c4963", userType: "healer", email: "contact@auraeye.solutions", credits: 2375, soulEnergy: 0 },
  { username: "healernishantacademy", password: "a1b8c8a1973ebd4c4d510e750c7afdcb2bbd77de01c5ca2aa61f546bcd12848012d406af85076946c9bbcead8ec0c14778a569e0b515226ce68daefb97b91937.5b11caa709c411a624b0246d443edf5f", userType: "healer", email: "info@healernishantacademy.com", credits: 3000, soulEnergy: 0 },
  { username: "Dr.AnjanaBarot", password: "4e82461819d3cd1e09f623b402fbf2025ed8f948091e5911c4c14b6881cd2c42d3dadb077651a4135cb78038e6cb985485ea0b9fe8829e69a47625db4c015b95.6bc1ca6f4fd417f5e6ce8999e8f9376b", userType: "healer", email: "aurareaderanjana@gmail.com", credits: 150, soulEnergy: 0 },
  { username: "Kalpana.Muralidhar", password: "a933dd39e2af5a17a50e0eb344b935c13200ed32b1408eef21a6d944b064982b0c835035b71c4fd0803cddff3d7d514a94cc524bda172ba243aad99b1520dd2c.303033dabb83ab42eb86a280a15e94da", userType: "healer", email: "kalpanaa.murli@gmail.com", credits: 138, soulEnergy: 0 },
  // test healer with known password "healer123" (re-hashed since original was bcrypt placeholder)
  { username: "test healer", password: "__REHASH_healer123__", userType: "healer", credits: 100, soulEnergy: 0 },
  // test client with known password "client123"
  { username: "test.client", password: "__REHASH_client123__", userType: "client", email: "test.client@spiritualwellness.com", credits: 5, soulEnergy: 0 },
];

// Healer profile data for known healers with full profiles
const HEALER_PROFILES: Array<{
  username: string;
  name: string;
  specialty: string;
  description: string;
  email: string;
  phone: string;
  imageUrl?: string;
  rating?: number;
  experience?: string;
  location?: string;
}> = [
  {
    username: "nishant.sharma2",
    name: "Nishant Sharma",
    specialty: "Aura Reading & Energy Healing",
    description: "Founded by Nishant Sharma, an IT Engineer with a Master's in Applied Positive Psychology & Coaching Psychology (UEL, London) and over 20 years as a certified Energy healer. AuraEye™ blends cutting-edge technology with authentic energy healing to bring spiritual wellness into the digital age.",
    email: "nishant@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    imageUrl: "/nishant-new.jpg",
    rating: 5,
    experience: "20+ years",
    location: "India"
  },
  {
    username: "Sunita.Mann",
    name: "Sunita Mann",
    specialty: "Spiritual Teacher & Healer",
    description: "Sunita Mann is a spiritual teacher & healer with over 20 years of experience. Trained in various modalities like Aura reading, Reiki healing, Angel's therapy etc. With almost 95% success rate in her spiritual evaluation, she can read your energies intuitively and can pinpoint the various issues along with helping you heal the blockages.",
    email: "sunita.mann@auraeye.com",
    phone: "+91-XXXXXXXXXX",
    imageUrl: "/sunita.jpg",
    rating: 5,
    experience: "20+ years",
    location: "India"
  },
  {
    username: "Subramanyam.v",
    name: "Mr. Subramayanam",
    specialty: "Energy Healer & Engineer",
    description: "Subramayanam is a Mechanical Engineer, Aura Reader, and Energy Healer who blends analytical precision with intuitive insight. With a strong foundation in engineering and energy diagnostics, he specialises in identifying energetic imbalances at their root cause.",
    email: "subramanyam.aurahealer@gmail.com",
    phone: "+91 4532147556",
    imageUrl: "/subramanyam.jpg",
    rating: 5,
    experience: "15+ years",
    location: "India"
  },
  {
    username: "test healer",
    name: "Test Healer",
    specialty: "Testing & Development",
    description: "Test healer account for development and testing purposes.",
    email: "test.healer@spiritualwellness.com",
    phone: "+1-555-9999",
    rating: 5,
    experience: "Testing",
    location: "Development Server"
  },
];

export async function seedAllUsers() {
  try {
    let inserted = 0;
    let updated = 0;

    for (const userData of CSV_USERS) {
      // Resolve placeholder passwords
      let password = userData.password;
      if (password === "__REHASH_healer123__") {
        password = await hashPassword("healer123");
      } else if (password === "__REHASH_client123__") {
        password = await hashPassword("client123");
      }

      // Check if user already exists
      const existing = await db.execute(
        sql`SELECT id, password FROM users WHERE LOWER(username) = LOWER(${userData.username}) LIMIT 1`
      );

      if (existing.rows.length > 0) {
        // Update password to ensure it matches (preserves existing if same)
        await db.execute(
          sql`UPDATE users SET 
            password = ${password},
            credits = GREATEST(credits, ${userData.credits}),
            email = COALESCE(email, ${userData.email ?? null}),
            mobile_number = COALESCE(mobile_number, ${userData.mobileNumber ?? null}),
            user_type = ${userData.userType}
          WHERE LOWER(username) = LOWER(${userData.username})`
        );
        updated++;
      } else {
        // Insert new user
        await db.execute(
          sql`INSERT INTO users (username, password, user_type, birth_date, email, mobile_number, credits, soul_energy, email_notifications_enabled, is_active)
          VALUES (
            ${userData.username},
            ${password},
            ${userData.userType},
            ${userData.birthDate ?? null},
            ${userData.email ?? null},
            ${userData.mobileNumber ?? null},
            ${userData.credits},
            ${userData.soulEnergy},
            true,
            true
          )
          ON CONFLICT (username) DO NOTHING`
        );
        inserted++;
      }
    }

    console.log(`✅ Users seeded: ${inserted} inserted, ${updated} updated`);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
  }
}

export async function seedAllHealers() {
  try {
    let inserted = 0;
    let updated = 0;

    // First ensure all healer-type users have a healer profile (minimal if not in HEALER_PROFILES)
    for (const userData of CSV_USERS) {
      if (userData.userType !== "healer") continue;

      // Get password for this user
      let password = userData.password;
      if (password === "__REHASH_healer123__") {
        password = await hashPassword("healer123");
      }

      // Check if healer profile exists
      const existingHealer = await db.execute(
        sql`SELECT id FROM healers WHERE LOWER(username) = LOWER(${userData.username}) LIMIT 1`
      );

      // Find full profile if available
      const fullProfile = HEALER_PROFILES.find(
        (p) => p.username.toLowerCase() === userData.username.toLowerCase()
      );

      if (existingHealer.rows.length > 0) {
        // Update password to stay in sync
        await db.execute(
          sql`UPDATE healers SET password = ${password} WHERE LOWER(username) = LOWER(${userData.username})`
        );
        updated++;
      } else {
        // Build healer profile - use full profile if available, otherwise create minimal one
        const name = fullProfile?.name ?? userData.username.replace(/[._]/g, " ");
        const specialty = fullProfile?.specialty ?? "Spiritual Healer";
        const description = fullProfile?.description ?? `${name} is a certified spiritual healer and energy reader.`;
        const email = fullProfile?.email ?? userData.email ?? `${userData.username.toLowerCase().replace(/\s/g, ".")}@aurfy.com`;
        const phone = fullProfile?.phone ?? userData.mobileNumber ?? "+91-XXXXXXXXXX";
        const imageUrl = fullProfile?.imageUrl ?? null;
        const rating = fullProfile?.rating ?? 5;
        const experience = fullProfile?.experience ?? null;
        const location = fullProfile?.location ?? "India";

        await db.execute(
          sql`INSERT INTO healers (name, username, password, specialty, description, email, phone, image_url, rating, experience, location)
          VALUES (
            ${name},
            ${userData.username},
            ${password},
            ${specialty},
            ${description},
            ${email},
            ${phone},
            ${imageUrl},
            ${rating},
            ${experience},
            ${location}
          )
          ON CONFLICT (username) DO NOTHING`
        );
        inserted++;
      }
    }

    console.log(`✅ Healers seeded: ${inserted} inserted, ${updated} updated`);
  } catch (error) {
    console.error("❌ Error seeding healers:", error);
  }
}

export async function runStartupSeed() {
  await seedAllUsers();
  await seedAllHealers();

  const userCount = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
  const healerCount = await db.execute(sql`SELECT COUNT(*) as count FROM healers`);
  console.log(`🌱 DB ready: ${userCount.rows[0]?.count} users, ${healerCount.rows[0]?.count} healers`);
}
