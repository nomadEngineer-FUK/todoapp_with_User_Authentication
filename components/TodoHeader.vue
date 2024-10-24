<template>
    <div class="todo-list">
        <h1 class="header">Todo List</h1>

        <!-- ハンバーガーメニュー -->
        <HamburgerMenu />
    </div>
</template>

<style scoped>
.todo-list {
    width: 85%;
    margin: 0 auto;
    border-bottom: 1px solid rgba(100,100,100,0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}
.header {
    margin: 0.4rem;
    flex-grow: 1;
    text-align: center;
}
</style>
