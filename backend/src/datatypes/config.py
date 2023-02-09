import os


class MythrilConfiguration:
    # Config from Ethpector modified to allow to pass arguments instead of using env
    def __init__(self, args):
        self._mythril_concolic = args.get("concolic")
        self._strategy = args.get("strategy")
        self._execution_timeout = args.get("execution_timeout")
        self._max_depth = args.get("max_depth")
        self._loop_bound = args.get("loop_bound")
        self._create_timeout = args.get("create_timeout")
        self._solver_timeout = args.get("solver_timeout")
        self._call_depth_limit = args.get("call_depth_limit")
        self._transaction_count = args.get("transaction_count")

    def concolic_exec(self) -> bool:
        return (
            self._mythril_concolic
            if self._mythril_concolic
            else bool(os.getenv("ETHPECTOR_MYTHRIL_CONCOLICEXEC"))
        )

    def strategy(self) -> str:
        # one of ["dfs", "bfs", "naive-random", "weighted-random"]
        if (self._strategy):
            return self._strategy

        env = os.getenv("ETHPECTOR_MYTHRIL_STRATEGY")
        return env if env else "bfs"

    def execution_timeout(self) -> int:
        if (self._execution_timeout):
            return self._execution_timeout

        env = os.getenv("ETHPECTOR_MYTHRIL_EXECUTION_TIMEOUT")
        return int(env) if env else 30

    def max_depth(self) -> int:
        if self._max_depth:
            return self._max_depth

        env = os.getenv("ETHPECTOR_MYTHRIL_MAX_DEPTH")
        return int(env) if env else 128

    def loop_bound(self) -> int:
        if self._loop_bound:
            return self._loop_bound

        env = os.getenv("ETHPECTOR_MYTHRIL_LOOP_BOUND")
        return int(env) if env else 5

    def create_timeout(self) -> int:
        if self._create_timeout:
            return self._create_timeout
        env = os.getenv("ETHPECTOR_MYTHRIL_CREATE_TIMEOUT")
        return int(env) if env else 40

    def solver_timeout(self) -> int:
        if self._solver_timeout:
            return self._solver_timeout
        # The maximum amount of time(in milli seconds) the solver
        # spends for queries from analysis modules
        env = os.getenv("ETHPECTOR_MYTHRIL_SOLVER_TIMEOUT")
        return int(env) if env else 10000

    def call_depth_limit(self) -> int:
        if self._call_depth_limit:
            return self._call_depth_limit
        env = os.getenv("ETHPECTOR_MYTHRIL_CALL_DEPTH_LIMIT")
        return int(env) if env else 10

    def transaction_count(self) -> int:
        if self._transaction_count:
            return self._transaction_count
        env = os.getenv("ETHPECTOR_MYTHRIL_TRANSACTION_COUNT")
        return int(env) if env else 3

    def __repr__(self):
        return (
            f"{self.__class__.__name__}("
            f"concolic_exec={self.concolic_exec()},"
            f"strategy={self.strategy()},"
            f"execution_timeout={self.execution_timeout()},"
            f"max_depth={self.max_depth()},"
            f"loop_bound={self.loop_bound()},"
            f"create_timeout={self.create_timeout()},"
            f"solver_timeout={self.solver_timeout()},"
            f"call_depth_limit={self.call_depth_limit()},"
            f"transaction_count={self.transaction_count()}"
            ")"
        )
