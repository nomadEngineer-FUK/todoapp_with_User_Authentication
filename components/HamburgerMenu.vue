<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useAuth } from '~/composables/useAuth';
  
  const { isAuthenticated, logout, checkUser } = useAuth();
  const menuOpen = ref(false);
  
  const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
  };

  const closeMenu = () => {
    menuOpen.value = false;
  };
  
  const logoutUser = async () => {
    await logout();
  };
  
  onMounted(() => {
    checkUser(); // ページがマウントされたときにユーザーの認証状態を確認
  });
</script>

<template>
    <div class="menu-container">
        <div class="hamburger" @click="toggleMenu">
            ☰
        </div>
        <nav v-if="menuOpen" class="menu">
            <ul>
                <li>
                    <NuxtLink to="/"@click="closeMenu">Home</NuxtLink>
                </li>
                <li v-if="!isAuthenticated">
                    <NuxtLink to="/login">Login</NuxtLink>
                </li>
                <li v-if="isAuthenticated" @click="logoutUser" class="logout">
                    Logout
                </li>
            </ul>
        </nav>
    </div>
</template>
  
<style scoped>
.menu-container {
    position: relative;
}
.hamburger {
    font-size: 30px;
    cursor: pointer;
    z-index: 20;
}
.menu {
    border: 1px solid rgba(100,100,100,0.2);
    background-color: #fff;
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    margin-top: 0.5rem; /* TodoHeaderのMarginを考慮 */
}
.menu ul {
    list-style-type: none;
    padding: 0;
}
.menu li {
    padding: 0.5rem 3rem;
}
.menu li:hover {
    background-color: rgba(0, 100, 200, 0.2);
    transition: 0.3s;
}
.menu li a{
    text-decoration: none;
}

.logout {
    cursor: pointer;
}
</style>
