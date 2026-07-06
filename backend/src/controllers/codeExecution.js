import { ENV } from '../lib/env.js';

const JDOODLE_LANGUAGES = {
  python: { language: 'python3', versionIndex: '4' },
  java:   { language: 'java',    versionIndex: '4' },
  cpp:    { language: 'cpp17',   versionIndex: '1' },
};

// If JDoodle hits its daily limit, Wandbox takes over
// Compiler names: check https://wandbox.org/api/list.json for current names
const WANDBOX_COMPILERS = {
  python: 'cpython-3.12.3',
  java:   'openjdk-jdk-21+35',
  cpp:    'gcc-12.2.0',
};

const callJDoodle = async (script, language) => {
  const lang = JDOODLE_LANGUAGES[language];
  const res = await fetch('https://api.jdoodle.com/v1/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: ENV.JDOODLE_CLIENT_ID,
      clientSecret: ENV.JDOODLE_CLIENT_SECRET,
      script,
      language: lang.language,
      versionIndex: lang.versionIndex,
    }),
  });

  const data = await res.json();

  if (data.statusCode === 429 || data.output?.toLowerCase().includes('limit for today')) {
    throw new Error('CREDIT_LIMIT');
  }
  if (data.error) throw new Error(data.error);
  return { output: data.output || '', source: 'jdoodle' };
};

const callWandbox = async (script, language) => {
  const compiler = WANDBOX_COMPILERS[language];
  if (!compiler) throw new Error(`No Wandbox fallback for: ${language}`);

  const res = await fetch('https://wandbox.org/api/compile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler, code: script }),
  });

  const data = await res.json();
  if (data.compiler_error) return { output: `Compile error:\n${data.compiler_error}`, source: 'wandbox' };
  return { output: data.program_output || data.program_message || '', source: 'wandbox' };
};

const runWithFallback = async (script, language) => {
  try {
    return await callJDoodle(script, language);
  } catch (err) {
    if (err.message === 'CREDIT_LIMIT') {
      return await callWandbox(script, language);
    }
    throw err;
  }
};

export const executeCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ msg: 'Code is required' });
    if (!JDOODLE_LANGUAGES[language]) {
      return res.status(400).json({ msg: `Unsupported language: ${language}` });
    }

    const { output, source } = await runWithFallback(code, language);
    res.status(200).json({ output, source });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};
