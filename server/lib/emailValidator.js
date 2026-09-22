/**
 * Comprehensive Email Validator & Disposable Domain Blocker
 * Ensures registrations use legitimate, real email addresses
 */

const DISPOSABLE_DOMAINS = new Set([
  // Popular temporary & throwaway email providers
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmailo.com',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamailblock.com',
  'grr.la',
  'pokemail.net',
  'spam4.me',
  'sharklasers.com',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'courriel.fr.nf',
  'dispostable.com',
  'fake.com',
  'fakemail.com',
  'fakemailgenerator.com',
  'fakeinbox.com',
  'test.com',
  'example.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'mytrashmail.com',
  'getairmail.com',
  'inboxkitten.com',
  'mohmal.com',
  'nada.ltd',
  'crazymailing.com',
  'generator.email',
  'emailondeck.com',
  'mytemp.email',
  'mytempemail.com',
  'maildrop.cc',
  'harakirimail.com',
  'discard.email',
  'discardmail.com',
  'dropmail.me',
  'temp-mail.space',
  'tmpmail.org',
  'tempinbox.com',
  'throwaway.com',
  'mailcatch.com',
  'mintemail.com',
  'zippymail.info',
  'jetable.org',
  'kasmail.com',
  'filzmail.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'einrot.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'tinypm.com',
  'mailsac.com',
  'inboxproxy.com',
  'burnermail.io',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'letthemeatspam.com',
  'mailin8r.com',
  'mailinator2.com',
  'notmailinator.com',
  'reallymymail.com',
  'reconmail.com',
  'safetymail.info',
  'sendspamhere.com',
  'sogetthis.com',
  'spambooger.com',
  'spamherelots.com',
  'spamhereplease.com',
  'spamthisplease.com',
  'streetwisemail.com',
  'suremail.info',
  'thisisnotmyrealemail.com',
  'tradermail.info',
  'veryrealemail.com',
  'zippymail.info',
  'spamex.com',
  'meltmail.com',
  'mailnesia.com',
  'tempail.com',
  'mohmal.in',
  'emailfake.com',
  'crazymailing.com'
]);

// Standard Email Regex conforming to RFC 5322 specifications
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Obvious dummy / spam prefix patterns
const OBVIOUS_FAKE_PREFIXES = [
  'asdf', 'test', 'fake', 'dummy', 'qwerty', 'tester', 'random', 'testing', 'sample', 'temp'
];

/**
 * Validates whether an email is a legitimate, non-disposable address
 * @param {string} email
 * @returns {{ isValid: boolean, message?: string, normalizedEmail?: string }}
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Please provide an email address' };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic length constraints
  if (trimmed.length < 5 || trimmed.length > 254) {
    return { isValid: false, message: 'Email address length is invalid (must be between 5 and 254 characters)' };
  }

  // Syntax check
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email format (e.g. name@gmail.com)' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Invalid email structure' };
  }

  const [localPart, domain] = parts;

  // Local part constraints
  if (localPart.length > 64 || localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { isValid: false, message: 'Invalid email username structure' };
  }

  // Domain constraints
  const domainParts = domain.split('.');
  if (domainParts.length < 2) {
    return { isValid: false, message: 'Email domain must include a valid top-level extension (e.g. .com, .pk)' };
  }

  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-z]{2,24}$/.test(tld)) {
    return { isValid: false, message: 'Email domain extension is not valid' };
  }

  // Block known disposable / temporary email domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      message: 'Disposable or temporary email services are not permitted. Please use your real personal email (e.g. Gmail) or click "Sign in with Google".'
    };
  }

  // Block obvious dummy combinations like test@test.com, asdf@asdf.com, fake@fake.com
  const isObviousDummy = OBVIOUS_FAKE_PREFIXES.some(prefix => {
    return localPart === prefix && (domain.startsWith(prefix) || domain.includes('fake') || domain.includes('test'));
  });

  if (isObviousDummy) {
    return {
      isValid: false,
      message: 'Please provide a genuine email address. Test or dummy accounts are not permitted.'
    };
  }

  return {
    isValid: true,
    normalizedEmail: trimmed
  };
}

module.exports = {
  validateEmail,
  DISPOSABLE_DOMAINS
};
