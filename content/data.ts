import type { PortfolioContent } from './types';

export const content: PortfolioContent = {
  identity: {
    name: 'Prasham',
    role: 'B.Tech ICT @ DAU — VLSI testing, applied ML, computational finance',
    bio:
      'Second-year undergrad working on GNN-based ATPG, computational ' +
      'finance models, and open-source contributions. Comfortable across ' +
      'PyTorch, PyG, MATLAB, and CUDA-accelerated training.',
    location: 'Gandhinagar, India',
    socials: [
      { label: 'GitHub', href: 'https://github.com/Prasham27' },
      // TODO (REMINDERS.md): swap placeholder for real LinkedIn URL.
      { label: 'LinkedIn', href: 'https://linkedin.com/in/your-handle' },
    ],
  },

  projects: [
    {
      id: 'detective-atpg',
      name: 'DETECTive',
      tagline: 'GNN + LSTM model that predicts ATPG test patterns from circuit topology',
      summary:
        'Reimplementation and extension of the GLSVLSI 2024 paper that applies ' +
        'graph and sequential models to automatic test-pattern generation for ' +
        'ISCAS85 benchmarks.',
      description:
        'DETECTive treats a combinational circuit as a directed graph of gates ' +
        'and uses a stack of GATConv and GCNConv layers to embed each node, ' +
        'followed by an LSTM that predicts a test-pattern over the primary ' +
        'inputs. Training runs on a single RTX 3060 against the ISCAS85 set, ' +
        'with the loss shaped to reward fault coverage rather than exact-match ' +
        'on a single solution. The standout result is a 17.6× speedup over a ' +
        'classical baseline on c432 and 83.58% pool validation accuracy. The ' +
        'failure mode worth flagging is c499: bit-accuracy drops 44.3 points, ' +
        'which is consistent with reconvergent fanout confounding the message-' +
        'passing layers.',
      category: 'ml',
      status: 'shipped',
      startDate: '2025-01-01',
      endDate: '2025-04-01',
      stack: ['PyTorch', 'PyG', 'CUDA', 'Python'],
      tags: ['GNN', 'GATConv', 'GCNConv', 'LSTM', 'ATPG', 'VLSI'],
      metrics: [
        { label: 'Speedup on c432', value: '17.6×', context: 'vs. classical ATPG' },
        { label: 'Pool validation accuracy', value: '83.58%' },
        { label: 'Bit-accuracy drop on c499', value: '−44.3pp', context: 'reconvergent fanout' },
      ],
      links: { github: 'https://github.com/Prasham27/detective-atpg' },
      featured: true,
    },

    {
      id: 'gilt-funds-eda',
      name: 'Indian Gilt Funds — comparative analysis',
      tagline: 'OLS, ARIMA vs Random Forest, and VaR on AMFI/RBI/FRED data',
      summary:
        'EDA and modelling pass on Indian gilt fund returns: regime detection ' +
        'via macro covariates, ARIMA baselines vs Random Forest, and historical VaR.',
      description:
        'A study of Indian government-securities mutual funds joining AMFI NAV ' +
        'history with RBI policy-rate series and FRED macro indicators. The ' +
        'modelling layer compares OLS and ARIMA baselines against a Random ' +
        'Forest fed engineered macro features, with regime detection used to ' +
        'segment the series before training. Risk is reported as historical VaR ' +
        'with rolling windows; the writeup focuses on where the simpler ' +
        'baselines win and where the tree ensemble actually pays for itself.',
      category: 'finance',
      status: 'shipped',
      startDate: '2024-09-01',
      endDate: '2024-12-15',
      stack: ['Python', 'pandas', 'scikit-learn', 'statsmodels'],
      tags: ['time-series', 'OLS', 'ARIMA', 'random-forest', 'VaR'],
      links: {},
      featured: true,
    },

    {
      id: 'polar-codes-matlab',
      name: 'Advanced Polar Codes',
      tagline: 'Successive cancellation list decoding with CRC concatenation (MATLAB)',
      summary:
        'MATLAB implementation of polar codes with SCL decoding and CRC-aided ' +
        'list pruning for short-block AWGN channels.',
      description:
        'A MATLAB implementation of polar coding focused on the short-block ' +
        'regime where successive-cancellation list decoding meaningfully ' +
        'outperforms plain SC. CRC concatenation is used to prune the surviving ' +
        'paths after decoding, with BER curves swept across SNR over an AWGN ' +
        'channel. The interest is less the code itself and more the diagnostics ' +
        'around list-size vs. block-length trade-offs.',
      category: 'systems',
      status: 'shipped',
      startDate: '2024-08-01',
      endDate: '2024-11-01',
      stack: ['MATLAB'],
      tags: ['coding-theory', 'information-theory', 'SCL', 'CRC'],
      links: {},
      featured: true,
    },

    {
      id: 'podem',
      name: 'PODEM from scratch',
      tagline: '5-valued logic ATPG with full step-trace output',
      summary:
        'Course implementation of PODEM (path-oriented decision making) in ' +
        'Python on top of an existing D-algorithm codebase.',
      description:
        'A Python implementation of PODEM built on top of the verified ' +
        'D-algorithm suite. The decision tree, backtrace, and objective ' +
        'selection are written from scratch over five-valued logic, and every ' +
        'step is emitted as a trace so the sequence of objectives, backtraces, ' +
        'and implications is visible end-to-end. Useful as a teaching artifact ' +
        'and as a baseline to compare against the D-algorithm.',
      category: 'vlsi',
      status: 'shipped',
      startDate: '2024-08-01',
      endDate: '2024-10-15',
      stack: ['Python'],
      tags: ['ATPG', 'PODEM', 'fault-simulation', '5-valued-logic'],
      links: {},
      featured: false,
    },

    {
      id: 'd-algorithm',
      name: 'D-algorithm — verified suite',
      tagline: '23-test-case suite including ISCAS85 benchmarks',
      summary:
        'Debugging and rewrite of a five-valued logic D-algorithm, with four ' +
        'correctness bugs fixed and a 23-test verification suite covering ' +
        'ISCAS85 benchmarks.',
      description:
        'A working D-algorithm implementation in Python with explicit J- and ' +
        'D-frontier handling over five-valued logic. Four correctness bugs in ' +
        'the prior version were fixed: contradiction handling, fault-node ' +
        'consistency, J-frontier indentation, and XOR/XNOR branching. The 23-' +
        'case verification suite includes ISCAS85 benchmarks alongside small ' +
        'targeted circuits that isolate each fix.',
      category: 'vlsi',
      status: 'shipped',
      startDate: '2024-06-01',
      endDate: '2024-08-01',
      stack: ['Python'],
      tags: ['D-algorithm', 'ATPG', 'ISCAS85', '5-valued-logic'],
      metrics: [
        { label: 'Verification cases', value: '23' },
        { label: 'Bugs fixed', value: '4', context: 'vs. prior implementation' },
      ],
      links: {},
      featured: false,
    },
  ],

  skills: [
    { name: 'Python', category: 'languages', level: 5, yearsUsed: 4 },
    { name: 'PyTorch', category: 'ml', level: 4, yearsUsed: 2 },
    { name: 'PyTorch Geometric', category: 'ml', level: 3, yearsUsed: 1 },
    { name: 'C++', category: 'languages', level: 3, yearsUsed: 2 },
    { name: 'MATLAB', category: 'languages', level: 3, yearsUsed: 2 },
    { name: 'TypeScript', category: 'languages', level: 2, yearsUsed: 1 },
    { name: 'CUDA / RTX 3060 training', category: 'systems', level: 3, yearsUsed: 1 },
    { name: 'VLSI testing theory', category: 'theory', level: 4, yearsUsed: 2 },
    { name: 'Computational Finance', category: 'theory', level: 3, yearsUsed: 1 },
  ],

  experience: [
    {
      id: 'dau-btech',
      title: 'B.Tech, Information & Communication Technology',
      organization: 'Dhirubhai Ambani University',
      period: 'Aug 2023 — present',
      type: 'education',
      highlights: [
        'Minor in Computer Science',
        'Coursework: Computational Finance, Modelling & Simulation, High Performance Computing, VLSI Testing & Validation',
        'Student ID 202301252',
      ],
    },
    {
      id: 'kornia-contrib',
      title: 'Open-source contributions',
      organization: 'Kornia (computer-vision library)',
      period: '2025',
      type: 'open-source',
      highlights: [
        'Hartley normalization for get_perspective_transform',
        'Working with maintainers on PR review',
      ],
    },
  ],
};
