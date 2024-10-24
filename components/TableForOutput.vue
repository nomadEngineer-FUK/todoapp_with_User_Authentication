<template>
    <!-- Todosの表示テーブル -->
    <table class="table-for-output">

        <!-- テーブルのHeader -->
        <TableHeader />

        <!-- テーブルのBody -->
        <TableData />
    </table>
</template>

<style scoped>
.table-for-output {
    margin: 0.5rem auto 0;
    width: 80%;
    text-align: center;
    border-collapse: collapse;
}

</style>
